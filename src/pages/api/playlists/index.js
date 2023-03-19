import { getToken } from "next-auth/jwt";
import axios from "axios";

export default async function handler(req, res) {
  const { accessToken } = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  try {
    const { data } = await axios.get(
      "https://api.spotify.com/v1/me/playlists",
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error });
  }
}
