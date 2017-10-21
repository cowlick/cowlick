{
  var b = require("../lib/peg/action");
  b.dependencies = [];
}

Start
  = Frames

Frames
  = fs:Frame+ EOF {
    return {
      dependencies: b.dependencies,
      frames: fs
    };
  }

Frame
  = label:Label? ts:Tags text:(Newline Text)? {
    if(text) {
      ts.push(text[1]);
    }
    return b.frame(ts, label);
  }
  / label:Label? text:Text { return b.frame([text], label); }

Label
  = "*" label:LabelValue Newline { return label; }

LabelValue
  = $( ( !Newline !EOF !Space !"|" . )+ )

Tags
  = Comments c:Tag cs:(Newline Comments Tag)* {
    return b.contents(c, cs.map(function(c) { return c[2]; }));
  }

Tag
  = Links
  / IScript
  / IfExpression
  / SingleTag

SingleTag
  = "@" content:TagContent condition:(_ Condition)? &(Newline / EOF) {
    if(condition) {
      return [b.condition(condition[1], content)];
    } else {
      return content;
    }
  }
  / "[" content:TagContent _ condition:Condition? _ "]" {
    if(condition) {
      return [b.condition(condition, content)];
    } else {
      return content;
    }
  }

TagContent
  = Image
  / PlayBgm
  / StopBgm
  / PlaySe
  / StopSe
  / Eval
  / S
  / HideMessage
  / LayOpt
  / Jump
  / ClearSysVar
  / ClearVar
  / Timeout
  / UserDefined

Image
  = "image" _ "storage=" assetId:AttributeValue _ "layer=" layer:AttributeValue options:LayerOptions {
    return [b.image(assetId, layer, options)];
  }

PlayBgm
  = "playbgm" _ "storage=" assetId:AttributeValue {
    return [b.playAudio(assetId, "bgm")];
  }

StopBgm
  = "stopbgm" { return [b.stopAudio("bgm")]; }

PlaySe
  = "playse" _ "storage=" assetId:AttributeValue {
    return [b.playAudio(assetId, "se")];
  }

StopSe
  = "stopse" { return [b.stopAudio("se")]; }

Eval
  = "eval" _ expression:ExpressionAttribute {
    return [b.evaluate(expression)];
  }

ExpressionAttribute
  = "exp=" expression:AttributeValue { return expression; }

S
  = "s" { return [b.trigger(false)]; }

HideMessage
  = "hidemessage" {
    return [
      b.layerConfig("message", [{ key: "visible", value: false }]),
      b.click([b.layerConfig("message", [{ key: "visible", value: true }])])
    ];
  }

LayOpt
  = "layopt" _ "layer=" name:AttributeValue options:LayerOptions {
    return [b.layerConfig(name, options)];
  }

LayerOptions
  = os:(_ LayerOption)* { return os.map(function(o) { return o[1]; }); }

LayerOption
  = "top=" x:Digits { return { key: "x", value: x }; }
  / "left=" y:Digits { return { key: "y", value: y }; }
  / "visible=" visible:Boolean { return { key: "visible", value: visible }; }
  / "opacity=" opacity:Digits { return { key: "opacity", value: opacity }; }

Jump
  = "jump" _ scene:("storage=" AttributeValue)? _ frame:("target=*" AttributeValue)? {
    var data = {};
    if(scene) {
      data.scene = scene[1];
    }
    if(frame) {
      data.frame = frame[1];
    }
    return [b.jump(data)];
  }

ClearSysVar
  = "clearsysvar" {
    return [b.clearSystemVariables()];
  }

ClearVar
  = "clearvar" {
    return [b.clearCurrentVariables()];
  }

Timeout
   = "timeout" _ time:("time=" AttributeValue) _ scene:("storage=" AttributeValue)? _ frame:("target=*" AttributeValue)? options:TimeoutOptions {
    var j = {};
    if(scene) {
      j.scene = scene[1];
    }
    if(frame) {
      j.frame = frame[1];
    }
    options.push(b.jump(j));
    var data = {
      milliseconds: time[1],
      scripts: options
    };
    return [b.timeout(data)];
  }

TimeoutOptions
  = os:(_ TimeoutOption)* { return os.map(function(o) { return o[1]; }); }

TimeoutOption
  = expression:ExpressionAttribute { return b.evaluate(expression); }
  / "se=" assetId:AttributeValue { return b.playAudio(assetId, "se"); }

UserDefined
  = name:TagName attrs:(_ AttributeName "=" AttributeValue)* {
    return [b.tag(name, attrs.map(function(attr) { return { key: attr[1], value: attr[3]}; }))];
  }

TagName
  = $( ( !Newline !EOF !Space !"=" . )+ )

Condition
  = "cond=" expression:AttributeValue {
    return expression;
  }

Links
  = l:Link ls:(Newline Comments Link)* {
    return [b.choice(l, ls.map(function(l) { return l[2]; }))];
  }

Link
  = "@link" _ scene:("storage=" AttributeValue)? _ frame:("target=*" AttributeValue)? condition:(_ Condition)? Newline text:PlainText Newline EndLink {
    var data = {};
    if(scene) {
      data.scene = scene[1];
    }
    if(frame) {
      data.frame = frame[1];
    }
    if(condition) {
      return b.choiceItem(text, data, condition[1]);
    } else {
      return b.choiceItem(text, data);
    }
  }
  / "[link" _ scene:("storage=" AttributeValue)? _ frame:("target=*" AttributeValue)? _ condition:Condition? _ "]" Newline? text:PlainText EndLink {
    var data = {};
    if(scene) {
      data.scene = scene[1];
    }
    if(frame) {
      data.frame = frame[1];
    }
    return b.choiceItem(text, data, condition);
  }

EndLink
  = "@endlink" ( (Newline R) / &(Newline / EOF) )
  / Newline? "[endlink]" (Newline? R)?

IScript
  = "[iscript]" Newline script:IScriptValue Newline EndScript {
    return [b.evaluate(script)];
  }
  / "@iscript" Newline script:IScriptValue Newline EndScript {
    return [b.evaluate(script)];
  }

IScriptValue
  = $( ( !(Newline EndScript) . )* )

EndScript
  = "@endscript"
  / "[endscript]"

IfExpression
  = i:If is:Elsif* e:Else? EndIf {
    var result = {
      conditions: [i].concat(is)
    };
    if(e) {
      result.elseBody = e;
    } else {
      result.elseBody = [];
    }
    return [b.ifExpression(result)];
  }

If
  = "[if" _ expression:ExpressionAttribute _ "]" Newline? body:IfBody {
    return b.condition(expression, body).data;
  }
  / "@if" _ expression:ExpressionAttribute Newline body:IfBody {
    return b.condition(expression, body).data;
  }

IfBody
  = ts:Tags text:(Newline Text)? {
    if(text) {
      ts.push(text[1]);
    }
    return ts;
  }
  / text:Text { return [text]; }

Elsif
  = "[elsif" _ expression:ExpressionAttribute _ "]" Newline? body:IfBody {
    return b.condition(expression, body).data;
  }
  / "@elsif" _ expression:ExpressionAttribute Newline body:IfBody {
    return b.condition(expression, body).data;
  }

Else
  = "[else]" Newline? body:IfBody {
    return body;
  }
  / "@else" Newline body:IfBody {
    return body;
  }

EndIf
  = "[endif]" / "@endif"

Text
  = Comments cm:CM? Newline? values:TextBlock EndTextBlock {
    return b.text(values, cm);
  }

L
  = "[l]"
  / "@l" &(Newline / EOF)

CM
  = "[cm]"
  / "@cm" &(Newline / EOF)

TextBlock
  = Comments t:TextLine ts:(Newline Comments TextLine)* {
    return b.textBlock(t, ts.map(function(t) { return t[2]; }));
  }

R
  = "[r]"
  / "@r" &(Newline / EOF)

TextLine
  = top:R? Newline? values:(Ruby / PlainText / Emb)+ end:R? {
    return b.textLine(values, top, end);
  }

PlainText
  = $(Character+)

Character
  = $( !Newline !EOF !CM !L !R !Tag !EndLink !Ruby !Emb !If !Elsif !Else !EndIf . )

Ruby
  = "@ruby" _ "text=" rt:AttributeValue Newline rb:Character {
    return b.ruby(rb, rt);
  }
  / "[ruby" _ "text=" rt:AttributeValue "]" rb:Character {
    return b.ruby(rb, rt);
  }

Emb
  = "@emb" _ "exp=" exp:AttributeValue &(Newline / EOF) {
    return b.variable(exp);
  }
  / "[emb" _ "exp=" exp:AttributeValue _ "]" {
    return b.variable(exp);
  }

EndTextBlock
  = (L Newline? / Newline / EOF)?

AttributeName
  = $( ( !Newline !EOF !Space !"=" . )+ )

AttributeValue
  = StringLiteral
  / $( ( !Newline !EOF !Space !"]" . )+ )

StringLiteral
  = '"' l:$( ( !'"' . )+ ) '"' { return l; }

Digits
  = $(Digit+)

Digit
  = [0-9]

Boolean
  = "true" { return true; }
  / "false" { return false; }

Newline
  = "\r\n"
  / "\n"

Comments
  = (Comment (Newline / EOF))*

Comment
  = ";" ( !Newline !EOF . )*

_ "spacer"
  = $([ \t\r\n]*)

Space "space"
  = [ 　\t]

EOF
  = !.
