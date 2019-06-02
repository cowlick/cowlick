{
  var b = require("../lib/action");
  b.setup({
    base: options.base,
    relative: options.relative,
    dependencies: []
  });
}

Start
  = Frames

Frames
  = fs:Frame+ Newline* EOF {
    return b.frames(fs);
  }

Frame
  = Comments label:Label? body:FrameBody {
    return b.frame(body, label);
  }

FrameBody
  = ts:Tags Newline Comments skippable:WT Newline? {
    return b.waitTransition(ts, skippable);
  }
  / ts:Tags Newline Comments trigger:S Newline? {
    ts.push(trigger);
    return ts;
  }
  / ts:Tags Newline ( &Label / &EndScript / &Elsif / &Else / &EndIf / &EndIgnore ) {
    return ts;
  }
  / ts:Tags text:(Newline Text)? {
    return text ? ts.concat(text[1]) : ts;
  }
  / text:Text {
    return text;
  }

Label
  = "*" label:LabelValue Newline { return label; }

LabelValue
  = $( ( !Newline !EOF !Space !"|" . )+ )

WT
  = TagLeftBrace WTTagName _ skippable:CanSkipAttribute? _ TagRightBrace {
    if(skippable) {
      return b.tryParseLiteral(skippable);
    } else {
      return undefined;
    }
  }
  / OnelineTagOperator WTTagName _ skippable:CanSkipAttribute? &(Newline / EOF) {
    if(skippable) {
      return b.tryParseLiteral(skippable);
    } else {
      return undefined;
    }
  }

WTTagName = "wt"

S
  = TagLeftBrace STagName TagRightBrace {
    return b.trigger(false);
  }
  / OnelineTagOperator STagName {
    return b.trigger(false);
  }

STagName = "s"

Tags
  = Comments c:Tag cs:(Newline Comments Tag)* {
    return b.contents(c, cs.map(function(c) { return c[2]; }));
  }

Tag
  = Links
  / IScript
  / IfExpression
  / IgnoreExpression
  / SingleTag

SingleTag
  = OnelineTagOperator content:TagContent condition:(_ Condition)? &(Newline / EOF) {
    if(condition) {
      return [b.condition(condition[1], content)];
    } else {
      return content;
    }
  }
  / TagLeftBrace content:TagContent _ condition:Condition? _ TagRightBrace {
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
  / Delay
  / Font
  / NoWait
  / EndNoWait
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
  = "top=" y:AttributeNumberValue { return { key: "y", value: y }; }
  / "left=" x:AttributeNumberValue { return { key: "x", value: x }; }
  / "visible=" visible:Boolean { return { key: "visible", value: visible }; }
  / "opacity=" opacity:AttributeNumberValue { return { key: "opacity", value: opacity }; }

Jump
  = "jump" _ scene:StorageAttribute? _ frame:TargetAttribute? {
    var data = {
      tag: "jump"
    };
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
    var j = {
      tag: "jump"
    };
    if(scene) {
      j.scene = scene;
    }
    if(frame) {
      j.frame = frame;
    }
    options.push(b.jump(j));
    var data = {
      tag: "timeout",
      milliseconds: time[1],
      scripts: options
    };
    return [data];
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
    var j = {
      tag: "jump"
    };
    if(scene) {
      j.scene = scene;
    }
    if(frame) {
      j.frame = frame;
    }
    scripts.push(b.jump(j));
    var data = {
      tag: "button",
      image: {
        assetId: assetId,
        layer: {
          name: "choice",
          x: x,
          y: y
        }
      },
      scripts: scripts
    };
    return [data];
  }

FreeImage
  = "freeimage" _ name:LayerAttribute {
    return [b.removeLayer(name)];
  }

Click
  = "click" _ scene:StorageAttribute? _ frame:TargetAttribute? options:JumpOptions {
    var j = {
      tag: "jump"
    };
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
    var data = {
      tag: "font"
    };
    b.concatKeyValues(data, options);
    return [data];
  }

FontOptions
  = os:(_ FontOption)* { return os.map(function(o) { return o[1]; }); }

FontOption
  = value:SizeAttribute { return { key: "size", value: value }; }
  / value:ColorAttribute { return { key: "color", value: value }; }

NoWait
  = "nowait" { return [b.realTimeDisplay(true)]; }

EndNoWait
  = "endnowait" { return [b.realTimeDisplay(false)]; }

UserDefined
  = name:UserDefinedTagName attrs:(_ UserDefinedAttribute)* {
    return [b.tag(name, attrs.map(function(attr) { return attr[1]; }))];
  }

UserDefinedTagName
  = $(
      !(STagName TagRightBrace)
      !WTTagName
      !LinkTagName
      !EndLinkTagName
      !IScriptTagName
      !EndScriptTagName
      !IfTagName
      !ElsifTagName
      !ElseTagName
      !EndIfTagName
      !IgnoreTagName
      !EndIgnoreTagName
      !CMTagName
      !(LTagName TagRightBrace)
      !(RTagName TagRightBrace)
      (
        !Newline
        !EOF
        !Space
        !"="
        !TagLeftBrace
        !TagRightBrace
        !OnelineTagOperator
        !CommentOperator
        .
      )+
    )

Condition
  = "cond=" expression:AttributeValue {
    return expression;
  }

Links
  = l:Link ls:(Newline Comments Link)* {
    return [b.choice(l, ls.map(function(l) { return l[2]; }))];
  }

Link
  = OnelineTagOperator LinkTagName _ scene:StorageAttribute? _ frame:TargetAttribute? condition:(_ Condition)? Newline text:PlainText Newline EndLink {
    var data = {
      tag: "jump"
    };
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
  / TagLeftBrace LinkTagName _ scene:StorageAttribute? _ frame:TargetAttribute? _ condition:Condition? _ TagRightBrace Newline? text:PlainText EndLink {
    var data = {
      tag: "jump"
    };
    if(scene) {
      data.scene = scene;
    }
    if(frame) {
      data.frame = frame;
    }
    return b.choiceItem(text, data, condition);
  }

LinkTagName = "link"

EndLink
  = OnelineTagOperator EndLinkTagName ( (Newline R) / &(Newline / EOF) )
  / Newline? TagLeftBrace EndLinkTagName TagRightBrace (Newline? R)?

EndLinkTagName = "endlink"

IScript
  = TagLeftBrace IScriptTagName TagRightBrace Newline script:IScriptValue Newline EndScript {
    return [b.evaluate(script)];
  }
  / OnelineTagOperator IScriptTagName Newline script:IScriptValue Newline EndScript {
    return [b.evaluate(script)];
  }

IScriptTagName = "iscript"

IScriptValue
  = $( ( !(Newline EndScript) . )* )

EndScript
  = OnelineTagOperator EndScriptTagName
  / TagLeftBrace EndScriptTagName TagRightBrace

EndScriptTagName = "endscript"

IfExpression
  = i:If is:Elsif* e:Else? EndIf {
    return [
      {
        tag: "ifElse",
        conditions: [i].concat(is),
        elseBody: e ? e : []
      }
    ];
  }

If
  = TagLeftBrace IfTagName _ expression:ExpressionAttribute _ TagRightBrace Newline? body:FrameBody {
    return b.condition(expression, body);
  }
  / OnelineTagOperator IfTagName _ expression:ExpressionAttribute Newline body:FrameBody {
    return b.condition(expression, body);
  }

IfTagName = "if"

Elsif
  = TagLeftBrace ElsifTagName _ expression:ExpressionAttribute _ TagRightBrace Newline? body:FrameBody {
    return b.condition(expression, body);
  }
  / OnelineTagOperator ElsifTagName _ expression:ExpressionAttribute Newline body:FrameBody {
    return b.condition(expression, body);
  }

ElsifTagName = "elsif"

Else
  = TagLeftBrace ElseTagName TagRightBrace Newline? body:FrameBody {
    return body;
  }
  / OnelineTagOperator ElseTagName Newline body:FrameBody {
    return body;
  }

ElseTagName = "else"

EndIf
  = TagLeftBrace EndIfTagName TagRightBrace
  / OnelineTagOperator EndIfTagName

EndIfTagName = "endif"

IgnoreExpression
  = i:Ignore Newline? EndIgnore {
    return [
      {
        tag: "ifElse",
        conditions: [i],
        elseBody: []
      }
    ];
  }

Ignore
  = TagLeftBrace IgnoreTagName _ expression:ExpressionAttribute _ TagRightBrace Newline? body:FrameBody {
    return b.ignore(expression, body);
  }
  / OnelineTagOperator IgnoreTagName _ expression:ExpressionAttribute Newline body:FrameBody {
    return b.ignore(expression, body);
  }

IgnoreTagName = "ignore"

EndIgnore
  = TagLeftBrace EndIgnoreTagName TagRightBrace
  / OnelineTagOperator EndIgnoreTagName

EndIgnoreTagName = "endignore"

Text
  = Comments cm:CM? Newline? values:TextBlock Newline? EndTextBlock {
    var s = [];
    if(cm) {
      s.push(b.removeLayer("choice"));
    }
    s.push(b.text(values, cm));
    return s;
  }

L
  = TagLeftBrace LTagName TagRightBrace
  / OnelineTagOperator LTagName &(Newline / EOF)

LTagName
  = "l"

CM
  = TagLeftBrace CMTagName TagRightBrace
  / OnelineTagOperator CMTagName &(Newline / EOF)

CMTagName
  = "cm"

TextBlock
  = Comments t:TextLine ts:(Newline Comments TextLine)* {
    return b.textBlock(t, ts.map(function(t) { return t[2]; }));
  }

R
  = TagLeftBrace RTagName TagRightBrace
  / OnelineTagOperator RTagName &(Newline / EOF)

RTagName
  = "r"

TextLine
  = top:R? Newline? values:(Ruby / PlainText / Emb)+ end:R? {
    return b.textLine(values, top, end);
  }

PlainText
  = $(Character+)

Character
  = $(
      !Newline
      !EOF
      !CM
      !L
      !R
      !Tag
      !EndLink
      !Ruby
      !Emb
      !If
      !Elsif
      !Else
      !EndIf
      !WT
      !Ignore
      !EndIgnore
      !S
      .
    )

Ruby
  = OnelineTagOperator "ruby" _ rt:TextAttribute Newline rb:Character {
    return b.ruby(rb, rt);
  }
  / TagLeftBrace "ruby" _ rt:TextAttribute _ TagRightBrace rb:Character {
    return b.ruby(rb, rt);
  }

Emb
  = OnelineTagOperator "emb" _ exp:ExpressionAttribute &(Newline / EOF) {
    return b.variable(exp);
  }
  / TagLeftBrace "emb" _ exp:ExpressionAttribute _ TagRightBrace {
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
  / $( ( !Newline !EOF !Space !TagRightBrace . )+ )

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
  / "'true'" { return true; }
  / '"true"' { return true; }
  / "false" { return false; }
  / "'false'" { return false; }
  / '"false"' { return false; }

Newline
  = "\r\n"
  / "\n"

Comments
  = (Comment (Newline / EOF))*

Comment
  = CommentOperator ( !Newline !EOF . )*

TagLeftBrace
  = "["

TagRightBrace
  = "]"

CommentOperator
  = ";"

OnelineTagOperator
  = "@"

_ "spacer"
  = $([ \t\r\n]*)

Space "space"
  = [ 　\t]

EOF
  = !.
