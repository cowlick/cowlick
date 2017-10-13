{
  var b = require("../lib/peg/action");
}

Start
  = Frames

Frames
  = fs:Frame+ EOF { return fs; }

Frame
  = ts:Tags text:(Newline Text)? {
    if(text) {
      ts.push(text[1]);
    }
    return b.frame(ts);
  }
  / text:Text { return b.frame([text]); }

Tags
  = Comments c:Tag cs:(Newline Comments Tag)* {
    return b.contents(c, cs.map(function(c) { return c[2]; }));
  }

Tag
  = Links
  / SingleTag

SingleTag
  = "@" content:TagContent &(Newline / EOF) { return content; }
  / "[" content:TagContent _ "]" { return content; }

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
  = "eval" _ "exp=" expression:AttributeValue {
    return [b.evaluate(expression)];
  }

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

UserDefined
  = name:TagName attrs:(_ AttributeName "=" AttributeValue)* {
    return [b.tag(name, attrs.map(function(attr) { return { key: attr[1], value: attr[3]}; }))];
  }

TagName
  = $( ( !Newline !EOF !Space !"=" . )+ )

Links
  = l:Link ls:(Newline Comments Link)* {
    return [b.choice(l, ls.map(function(l) { return l[2]; }))];
  }

Link
  = "@link" _ scene:("storage=" AttributeValue)? _ frame:("target=*" AttributeValue) Newline text:PlainText Newline EndLink {
    if(scene) {
      return b.choiceItem(frame[1], text, scene[1]);
    } else {
      return b.choiceItem(frame[1], text);
    }
  }
  / "[link" _ scene:("storage=" AttributeValue)? _ frame:("target=*" AttributeValue) _ "]" Newline? text:PlainText EndLink {
    if(scene) {
      return b.choiceItem(frame[1], text, scene[1]);
    } else {
      return b.choiceItem(frame[1], text);
    }
  }

EndLink
  = "@endlink" ( (Newline R) / &(Newline / EOF) )
  / Newline? "[endlink]" (Newline? R)?

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
  = $( !Newline !EOF !CM !L !R !Tag !EndLink !Ruby !Emb . )

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
