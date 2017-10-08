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
  = Image
  / PlayBgm
  / StopBgm
  / PlaySe
  / StopSe

Image
  = "[image" _ "storage=" assetId:StringLiteral _ "layer=" layer:Attribute options:ImageOptions "]" {
    return b.image(assetId, layer, options);
  }

ImageOptions
  = os:(_ ImageOption)* { return os.map(function(o) { return o[1]; }); }

ImageOption
  = "top=" x:Digits { return { name: "x", value: x }; }
  / "left=" y:Digits { return { name: "y", value: y }; }

PlayBgm
  = "[playbgm" _ "storage=" assetId:StringLiteral _ "]" {
    return b.playAudio(assetId, "bgm");
  }

StopBgm
  = "[stopbgm]" { return b.stopAudio("bgm"); }

PlaySe
  = "[playse" _ "storage=" assetId:StringLiteral _ "]" {
    return b.playAudio(assetId, "se");
  }

StopSe
  = "[stopse]" { return b.stopAudio("se"); }

Text
  = Comments cm:CM? Newline? values:TextBlock EndTextBlock {
    return b.text(values, cm);
  }

L
  = "[l]"

CM
  = "[cm]"

TextBlock
  = Comments t:TextLine ts:(Newline Comments TextLine)* {
    return b.textBlock(t, ts.map(function(t) { return t[2]; }));
  }

R
  = "[r]"

TextLine
  = top:R? Newline? values:(Ruby / PlainText)+ end:R? {
    return b.textLine(values, top, end);
  }

PlainText
  = $(Character+)

Character
  = $( !Newline !EOF !CM !L !R !Tag !Ruby . )

Ruby
  = "[ruby" _ "text=" rt:StringLiteral "]" rb:Character {
    return b.ruby(rb, rt);
  }

EndTextBlock
  = (L Newline? / Newline / EOF)?

Attribute
  = $( ( !Newline !EOF !Space !'"' !"]" . )+ )

StringLiteral
  = '"' l:$( ( !Newline !Space !EOF !'"' . )+ ) '"' { return l; }

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
