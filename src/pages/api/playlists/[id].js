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
      `https://api.spotify.com/v1/playlists/${query.id}/tracks`,
      {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      }
    );
    res.status(200).json(data);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ error });
  }
}
