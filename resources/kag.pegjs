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
    return ts;
  }
  / text:Text { return [text]; }

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
  / UserDefined

Image
  = "image" _ "storage=" assetId:AttributeValue _ "layer=" layer:AttributeValue options:ImageOptions {
    return b.image(assetId, layer, options);
  }

ImageOptions
  = os:(_ ImageOption)* { return os.map(function(o) { return o[1]; }); }

ImageOption
  = "top=" x:Digits { return { name: "x", value: x }; }
  / "left=" y:Digits { return { name: "y", value: y }; }

PlayBgm
  = "playbgm" _ "storage=" assetId:AttributeValue {
    return b.playAudio(assetId, "bgm");
  }

StopBgm
  = "stopbgm" { return b.stopAudio("bgm"); }

PlaySe
  = "playse" _ "storage=" assetId:AttributeValue {
    return b.playAudio(assetId, "se");
  }

StopSe
  = "stopse" { return b.stopAudio("se"); }

Eval
  = "eval" _ "exp=" expression:AttributeValue {
    return b.evaluate(expression);
  }

S
  = "s" { return b.trigger(false); }

HideMessage
  = "hidemessage" { return b.visible("message", false); }

UserDefined
  = name:TagName attrs:(_ AttributeName "=" AttributeValue)* {
    return b.tag(name, attrs.map(function(attr) { return { name: attr[1], value: attr[3]}; }));
  }

TagName
  = $( ( !Newline !EOF !Space !"=" . )+ )

Links
  = l:Link ls:(Newline Comments Link)* {
    return b.choice(l, ls.map(function(l) { return l[2]; }));
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
  = top:R? Newline? values:(Ruby / PlainText)+ end:R? {
    return b.textLine(values, top, end);
  }

PlainText
  = $(Character+)

Character
  = $( !Newline !EOF !CM !L !R !Tag !EndLink !Ruby . )

Ruby
  = "@ruby" _ "text=" rt:AttributeValue Newline rb:Character {
    return b.ruby(rb, rt);
  }
  / "[ruby" _ "text=" rt:AttributeValue "]" rb:Character {
    return b.ruby(rb, rt);
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
