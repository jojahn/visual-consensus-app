import { decode, encode } from "./configEncoding.mjs";

export function share(config, state) {
  const [c, _configKeyMap] = encode(config);
  const [s, _stateKeyMap] = encode(state);
  const nextURL = "/?c=" + c + "&s=" + s;
  console.log(nextURL)
  window.history.replaceState({},
    "Visual Consensus", nextURL);
  // changeURLWithoutLoading();
  // TODO: Display flash with 'URL copied to clipboard'
}

function changeURLWithoutLoading(nextURL) {
  const nextTitle = "Visual Consensus";
  const nextState = { additionalInformation: "URL" };

  // This will create a new entry in the browser's history, without reloading
  window.history.pushState(nextState, nextTitle, nextURL);
  navigator.clipboard.writeText(location.origin + nextURL);
}

export function decodeConfigAndStateFromURL() {
  let config = null;
  let state = null;
  const searchParams = new URLSearchParams(location.search);
  if (searchParams.has("c")) {
    const configString = searchParams.get("c");
    config = decode(configString);
  }
  if (searchParams.has("s")) {
    const stateString = searchParams.get("s");
    state = decode(stateString);
  }
  return { config, state };
}

function buildKeyMaps() {
  
}