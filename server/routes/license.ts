import { Request, Response } from "express";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7KlxN05OoSCGHwjXhiiYyKF5bOXianLY",
  authDomain: "keysystem-d0b86-8df89.firebaseapp.com",
  projectId: "keysystem-d0b86-8df89",
  storageBucket: "keysystem-d0b86-8df89.firebasestorage.app",
  messagingSenderId: "1048409565735",
  appId: "1:1048409565735:web:5a9f5422826949490dfc02",
  measurementId: "G-GK1R043YTV",
};

let db: any;

function initializeFirebase() {
  if (!db) {
    const apps = getApps();
    if (apps.length === 0) {
      initializeApp(firebaseConfig);
    }
    db = getFirestore();
  }
  return db;
}

export async function handleActivateLicense(req: Request, res: Response) {
  const { licenseKey } = req.body;

  if (!licenseKey || typeof licenseKey !== "string") {
    return res.status(400).json({
      message: "License key is required",
    });
  }

  try {
    const firestore = initializeFirebase();
    const licensesRef = collection(firestore, "licenses");
    const q = query(licensesRef, where("key", "==", licenseKey.trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(400).json({
        message: "Clé de licence invalide",
      });
    }

    const licenseDoc = querySnapshot.docs[0];
    const licenseData = licenseDoc.data();

    if (licenseData.isActive === false) {
      return res.status(400).json({
        message: "Clé de licence désactivée",
      });
    }

    return res.status(200).json({
      message: "Licence activée avec succès",
      licenseId: licenseDoc.id,
    });
  } catch (error) {
    console.error("Error activating license:", error);
    return res.status(500).json({
      message: "Erreur serveur lors de l'activation",
    });
  }
}
