import { Request, Response } from "express";

const PROJECT_ID = "keysystem-d0b86-8df89";
const API_KEY = "AIzaSyD7KlxN05OoSCGHwjXhiiYyKF5bOXianLY";

function extractValue(field: any): any {
  if (!field) return null;
  if (field.stringValue !== undefined) return field.stringValue;
  if (field.integerValue !== undefined) return parseInt(field.integerValue);
  if (field.booleanValue !== undefined) return field.booleanValue;
  if (field.doubleValue !== undefined) return field.doubleValue;
  return null;
}

export async function handleDailyReset(req: Request, res: Response) {
  const { userId } = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({
      message: "User ID is required",
    });
  }

  try {
    // Get user data
    const userResponse = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${userId}?key=${API_KEY}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!userResponse.ok) {
      return res.status(400).json({
        message: "Utilisateur non trouvé",
      });
    }

    const userDoc = await userResponse.json();
    const userData = userDoc.fields;

    if (!userData) {
      return res.status(400).json({
        message: "Utilisateur non valide",
      });
    }

    const now = Date.now();
    const licenseExpiresAt = extractValue(userData.licenseExpiresAt);
    const lastMessageReset = extractValue(userData.lastMessageReset);
    const plan = extractValue(userData.plan);

    // Check if license has expired
    if (licenseExpiresAt && licenseExpiresAt <= now) {
      // License expired, reset to Free plan
      const updateQuery = {
        writes: [
          {
            update: {
              name: `projects/${PROJECT_ID}/databases/(default)/documents/users/${userId}`,
              fields: {
                plan: { stringValue: "Free" },
                messagesLimit: { integerValue: "10" },
                messagesUsed: { integerValue: "0" },
                licenseKey: { stringValue: "" },
                licenseExpiresAt: { nullValue: null },
              },
            },
          },
        ],
      };

      const updateResponse = await fetch(
        `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:batchWrite?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateQuery),
        }
      );

      if (!updateResponse.ok) {
        console.error("Error updating expired license:", await updateResponse.text());
      }

      return res.status(200).json({
        message: "Licence expirée - reverted to Free",
        plan: "Free",
        messagesLimit: 10,
        messagesUsed: 0,
      });
    }

    // Check if we need to reset messages for daily limit
    if (plan !== "Free" && lastMessageReset) {
      const lastResetDate = new Date(lastMessageReset).toDateString();
      const todayDate = new Date(now).toDateString();

      if (lastResetDate !== todayDate) {
        // Reset messages for the new day
        const resetQuery = {
          writes: [
            {
              update: {
                name: `projects/${PROJECT_ID}/databases/(default)/documents/users/${userId}`,
                fields: {
                  messagesUsed: { integerValue: "0" },
                  lastMessageReset: { integerValue: now.toString() },
                },
              },
            },
          ],
        };

        const resetResponse = await fetch(
          `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:batchWrite?key=${API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resetQuery),
          }
        );

        if (!resetResponse.ok) {
          console.error("Error resetting messages:", await resetResponse.text());
        }

        const messageLimit = extractValue(userData.messagesLimit) || 500;
        return res.status(200).json({
          message: "Messages réinitialisés pour aujourd'hui",
          messagesUsed: 0,
          messagesLimit: messageLimit,
        });
      }
    }

    return res.status(200).json({
      message: "Aucun reset nécessaire",
    });
  } catch (error) {
    console.error("Error in daily reset:", error);
    return res.status(500).json({
      message: "Erreur serveur lors du reset",
    });
  }
}
