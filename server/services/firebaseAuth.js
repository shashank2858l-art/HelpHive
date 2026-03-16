import admin from 'firebase-admin';

// Initialize Firebase Admin with credentials from environment (or default app credentials if deployed)
// For local development without a service account JSON, we can verify tokens using just the project ID
admin.initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID || 'helphive-dc43a'
});

export const verifyGoogleToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw new Error('Invalid authentication token');
  }
};
