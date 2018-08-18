export enum Tag {
  choice = "choice",
  image = "image",
  frameImage = "frameImage",
  pane = "pane",
  jump = "jump",
  text = "text",
  layer = "layer",
  playAudio = "playAudio",
  changeVolume = "changeVolume",
  stopAudio = "stopAudio",
  playVideo = "playVideo",
  stopVideo = "stopVideo",
  click = "click",
  skip = "skip",
  button = "button",
  trigger = "trigger",
  save = "save",
  load = "load",
  evaluate = "eval",
  link = "link",
  openSaveScene = "openSaveScene",
  openLoadScene = "openLoadScene",
  closeLoadScene = "closeLoadScene",
  condition = "condition",
  backlog = "backlog",
  removeLayer = "removeLayer",
  clearCurrentVariables = "clearCurrentVariables",
  clearSystemVariables = "clearSystemVariables",
  fadeIn = "fadeIn",
  fadeOut = "fadeOut",
  timeout = "timeout",
  ifElse = "ifElse",
  exception = "exception",
  slider = "slider",
  autoMode = "autoMode",
  messageSpeed = "messageSpeed",
  font = "font",
  realTimeDisplay = "realTimeDisplay",
  extension = "extension"
}

export namespace LayerKind {
  export const system = "system";
  export const background = "background";
  export const choice = "choice";
  export const message = "message";
  export const backlog = "backlog";
}

export namespace BuiltinVariable {
  export const selectedFont = "selectedFont";
  export const autoMode = "autoMode";
  export const autoMessageDuration = "autoMessageDuration";
  export const messageSpeed = "messageSpeed";
  export const fontSize = "fontSize";
  export const fontColor = "fontColor";
  export const realTimeDisplay = "realTimeDisplay";
  export const alreadyRead = "alreadyRead";
}

export enum VariableType {
  builtin = "builtin",
  system = "system",
  current = "current"
}

export namespace AudioGroup {
  export const voice = "voice";
  export const se = "se";
  export const bgm = "bgm";
}
