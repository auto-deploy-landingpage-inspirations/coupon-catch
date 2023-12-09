import admin from "firebase-admin";

export const checkAuth = async (req: any, res: any, next: any) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send("No token provided");
    }
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      // req.user = await admin.auth().verifyIdToken(token);
  
      next();
    } catch (error) {
      console.error("Error verifying auth token:", error);
      return res.status(403).send("Invalid token");
    }
  };

  export default checkAuth;