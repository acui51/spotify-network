export function fetcher(url, token) {
  return axios({
    method: "get",
    url,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
