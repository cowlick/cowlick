{
  var b = require("../lib/action");
  b.dependencies = [];
}

Start
  = Frames

Frames
  = fs:Frame+ Newline* EOF {
    return {
      dependencies: b.dependencies,
      frames: fs
    };
  }

Frame
  = Comments label:Label? ts:Tags Newline Comments skippable:WT Newline? {
    return b.frame(b.waitTransition(ts, skippable), label);
  }
  / Comments label:Label? ts:Tags text:(Newline Text)? {
    if(text) {
      ts.push(text[1]);
    }
    return b.frame(ts, label);
  }
  / Comments label:Label? text:Text {
    return b.frame([text], label);
  }

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
  / HideMessage
  / ShowHistory
  / LayOpt
  / Jump
  / ClearSysVar
  / ClearVar
  / Timeout
  / Button
  / FreeImage
  / Click
  / S
  / Delay
  / Font
  / UserDefined

Image
  = "image" _ assetId:StorageAttribute _ layer:LayerAttribute options:LayerOptions {
    return [b.image(assetId, layer, options)];
  }

PlayBgm
  = "playbgm" _ assetId:StorageAttribute {
    return [b.playAudio(assetId, "bgm")];
  }

StopBgm
  = "stopbgm" { return [b.stopAudio("bgm")]; }

PlaySe
  = "playse" _ assetId:StorageAttribute {
    return [b.playAudio(assetId, "se")];
  }

StopSe
  = "stopse" { return [b.stopAudio("se")]; }

Eval
  = "eval" _ expression:ExpressionAttribute {
    return [b.evaluate(expression)];
  }

S
  = "s" &"]" { return [b.trigger(false)]; }

HideMessage
  = "hidemessage" {
    return [
      b.layerConfig("message", [{ key: "visible", value: false }]),
      b.click([b.layerConfig("message", [{ key: "visible", value: true }])])
    ];
  }

ShowHistory
  = "showhistory" {
    return [b.backlog()];
  }

LayOpt
  = "layopt" _ name:LayerAttribute options:LayerOptions {
    return [b.layerConfig(name, options)];
  }

LayerOptions
  = os:(_ LayerOption)* { return os.map(function(o) { return o[1]; }); }

LayerOption
  = "top=" y:Digits { return { key: "y", value: y }; }
  / "left=" x:Digits { return { key: "x", value: x }; }
  / "visible=" visible:Boolean { return { key: "visible", value: visible }; }
  / "opacity=" opacity:Digits { return { key: "opacity", value: opacity }; }

Jump
  = "jump" _ scene:StorageAttribute? _ frame:TargetAttribute? {
    var data = {};
    if(scene) {
      data.scene = scene;
    }
    if(frame) {
      data.frame = frame;
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
   = "timeout" _ time:("time=" AttributeValue) _ scene:StorageAttribute? _ frame:TargetAttribute? options:JumpOptions {
    var j = {};
    if(scene) {
      j.scene = scene;
    }
    if(frame) {
      j.frame = frame;
    }
    options.push(b.jump(j));
    var data = {
      milliseconds: time[1],
      scripts: options
    };
    return [b.timeout(data)];
  }

JumpOptions
  = os:(_ JumpOption)* { return os.map(function(o) { return o[1]; }); }

JumpOption
  = expression:ExpressionAttribute { return b.evaluate(expression); }
  / assetId:SEAttribute { return b.playAudio(assetId, "se"); }

Button
  = "button" _ assetId:GraphicAttribute _ x:XAttribute _ y:YAttribute _ scene:StorageAttribute? _ frame:TargetAttribute? _ expression:ExpressionAttribute? {
    var scripts = [];
    if(expression) {
      scripts.push(b.evaluate(expression));
    }
    var j = {};
    if(scene) {
      j.scene = scene;
    }
    if(frame) {
      j.frame = frame;
    }
    scripts.push(b.jump(j));
    var data = {
      image: {
        assetId: assetId,
        layer: {
          name: "choice"
        }
      },
      x: x,
      y: y,
      scripts: scripts
    };
    return [b.button(data)];
  }

FreeImage
  = "freeimage" _ name:LayerAttribute {
    return [b.removeLayer(name)];
  }

Click
  = "click" _ scene:StorageAttribute? _ frame:TargetAttribute? options:JumpOptions {
    var j = {};
    if(scene) {
      j.scene = scene;
    }
    if(frame) {
      j.frame = frame;
    }
    options.push(b.jump(j));
    return [b.click(options)];
  }

Delay
  = "delay" _ speed:SpeedAttribute {
    return [b.messageSpeed(speed)];
  }

Font
  = "font" options:FontOptions {
    var data = {};
    b.concatKeyValues(data, options);
    return [b.font(data)];
  }

FontOptions
  = os:(_ FontOption)* { return os.map(function(o) { return o[1]; }); }

FontOption
  = value:SizeAttribute { return { key: "size", value: value }; }
  / value:ColorAttribute { return { key: "color", value: value }; }

UserDefined
  = name:TagName attrs:(_ UserDefinedAttribute)* {
    return [b.tag(name, attrs.map(function(attr) { return attr[1]; }))];
  }

TagName
  = $( ( !Newline !EOF !Space !"=" !WTName . )+ )

Condition
  = "cond=" expression:AttributeValue {
    return expression;
  }

Links
  = l:Link ls:(Newline Comments Link)* {
    return [b.choice(l, ls.map(function(l) { return l[2]; }))];
  }

Link
  = "@link" _ scene:StorageAttribute? _ frame:TargetAttribute? condition:(_ Condition)? Newline text:PlainText Newline EndLink {
    var data = {};
    if(scene) {
      data.scene = scene;
    }
    if(frame) {
      data.frame = frame;
    }
    if(condition) {
      return b.choiceItem(text, data, condition[1]);
    } else {
      return b.choiceItem(text, data);
    }
  }
  / "[link" _ scene:StorageAttribute? _ frame:TargetAttribute? _ condition:Condition? _ "]" Newline? text:PlainText EndLink {
    var data = {};
    if(scene) {
      data.scene = scene;
    }
    if(frame) {
      data.frame = frame;
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

WT
  = "[" WTName _ skippable:CanSkipAttribute? _ "]" {
    if(skippable) {
      return b.tryParseLiteral(skippable);
    } else {
      return undefined;
    }
  }
  / "@" WTName _ skippable:CanSkipAttribute? &(Newline / EOF) {
    if(skippable) {
      return b.tryParseLiteral(skippable);
    } else {
      return undefined;
    }
  }

WTName = "wt"

Text
  = Comments cm:CM? Newline? values:TextBlock Newline? EndTextBlock {
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
  = $( !Newline !EOF !CM !L !R !Tag !EndLink !Ruby !Emb !If !Elsif !Else !EndIf !WT . )

Ruby
  = "@ruby" _ rt:TextAttribute Newline rb:Character {
    return b.ruby(rb, rt);
  }
  / "[ruby" _ rt:TextAttribute "]" rb:Character {
    return b.ruby(rb, rt);
  }

Emb
  = "@emb" _ exp:ExpressionAttribute &(Newline / EOF) {
    return b.variable(exp);
  }
  / "[emb" _ exp:ExpressionAttribute _ "]" {
    return b.variable(exp);
  }

EndTextBlock
  = (L Newline? / Newline / EOF)?

ExpressionAttribute
  = "exp=" expression:AttributeValue { return expression; }

StorageAttribute
  = "storage=" storage:AttributeValue { return storage; }

TargetAttribute
  = "target=*" target:AttributeValue { return target; }

GraphicAttribute
  = "graphic=" graphic:AttributeValue { return graphic; }

XAttribute
  = "x=" x:AttributeNumberValue { return x; }

YAttribute
  = "y=" y:AttributeNumberValue { return y; }

CanSkipAttribute
  = "canskip=" skippable:AttributeValue { return skippable; }

LayerAttribute
  = "layer=" layer:AttributeValue { return layer; }

SEAttribute
  = "se=" assetId:AttributeValue { return assetId; }

SpeedAttribute
  = "speed=" speed:AttributeNumberValue { return speed; }

SizeAttribute
  = "size=" value:AttributeValue { return value; }

ColorAttribute
  = "color=" value:AttributeValue { return value; }

UserDefinedAttribute
  = key:AttributeName "=" value:AttributeValue {
    return {
      key: key,
      value: value
    };
  }

TextAttribute
  = "text=" value:AttributeValue { return value; }

AttributeName
  = $( ( !Newline !EOF !Space !"=" . )+ )

AttributeValue
  = StringLiteral
  / $( ( !Newline !EOF !Space !"]" . )+ )

AttributeNumberValue
  = StringDigits / Digits

StringDigits
  = '"' v:Digits '"' { return v; }
  / "'" v:Digits "'" { return v; }

StringLiteral
  = '"' l:$( ( !'"' . )+ ) '"' { return l; }
  / "'" l:$( ( !"'" . )+ ) "'" { return l; }

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
