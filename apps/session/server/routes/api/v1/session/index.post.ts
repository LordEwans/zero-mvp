export default eventHandler(async (event) => {
  const body = await readBody(event);
  const myHeaders = new Headers();
  myHeaders.append("Api-Key", "{YOUR_API_KEY}");

  var requestOptions: RequestInit = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  let res: any | string;

  fetch(
    `https://api.pop.anima.io/v1/sessions/${body.session_id}/details`,
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => (res = result))
    .catch((error) => console.error(error));
  return res;
});
