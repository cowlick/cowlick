{
  var b = require("./action");
}

Start
  = Frames

Frames
  = fs:Frame+ EOF { return fs; }

Frame
  = ts:Tags text:(Newline PlainText Newline?)? {
    if(text) {
      ts.push(text[1]);
    }
    return ts;
  }
  / text:PlainText Newline? { return [text]; }

Tags
  = c:Tag cs:(Newline Tag)* { return b.contents(c, cs.map(function(c) { return c[1]; })); }

Tag
  = Image

Image
  = "[image" _ "storage=" assetId:StringLiteral _ "layer=" layer:Attribute options:ImageOptions "]" {
    return b.image(assetId, layer, options);
  }

ImageOptions
  = os:(_ ImageOption)* { return os.map(function(o) { return o[1]; }); }

ImageOption
  = "top=" x:Digits { return { name: "x", value: x }; }
  / "left=" y:Digits { return { name: "y", value: y }; }

PlainText
  = CM Newline text:TextBlock { return text; }

CM
  = "[cm]"

TextBlock
  = t:Text ts:(Newline Text)* { return b.text(t, ts.map(function(t) { return t[1]; })); }

Text
  = $( ( !Newline !EOF !CM !Tag . )+ )

Attribute
  = $( ( !Newline !EOF !Space !'"' !"]" . )+ )

StringLiteral
  = '"' l:$( ( !Newline !Space !EOF !'"' . )+ ) '"' { return l; }

Digits
  = $(Digit+)
  ;

Digit
  = [0-9]
  ;

Newline
  = "\r\n"
  / "\n"
  ;

_ "spacer"
  = $([ \t\r\n]*)
  ;

Space "space"
  = [ 　\t]
  ;

EOF
  = !.
  ;