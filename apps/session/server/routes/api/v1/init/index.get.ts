export default eventHandler((event) => {
  const config = useRuntimeConfig();
  const myHeaders = new Headers();
  myHeaders.append("Api-Key", config.api);

  var requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    redirect: "follow",
  };

  let res: any | string;

  fetch("https://api.pop.anima.io/v1/personhood/init", requestOptions)
    .then((response) => response.text())
    .then((result) => res = result)
    .catch((error) => res = error);

  return res;
});