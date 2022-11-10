import { decode, encode } from "./configEncoding.mjs";

export function share(config, state) {
  const c = encode(config);
  const s = encode(state);
  const nextURL = "/?config=" + c + "&state=" + s;
  changeURLWithoutLoading();
  // TODO: Display flash with 'URL copied to clipboard'
  navigator.clipboard.writeText(location.origin + nextURL);
}

function changeURLWithoutLoading(nextURL) {
  const nextTitle = "Visual Consensus";
  const nextState = { additionalInformation: "URL" };

  // This will create a new entry in the browser's history, without reloading
  window.history.pushState(nextState, nextTitle, nextURL);
}

export function decodeConfigAndStateFromURL() {
  let config = null;
  let state = null;
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.has("config")) {
    const configString = searchParams.get("config");
    config = decode(configString);
  }
  if (searchParams.has("state")) {
    const stateString = searchParams.get("state");
    state = decode(stateString);
  }
  return [config, state];
}