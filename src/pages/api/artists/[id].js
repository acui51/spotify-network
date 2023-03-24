import { getToken } from "next-auth/jwt";
import axios from "axios";

export default async function handler(req, res) {
  const { accessToken } = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { query } = req;

  try {
    const { data } = await axios.get(
      `https://api.spotify.com/v1/artists/${query.id}`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    console.log("track data", data);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
}
