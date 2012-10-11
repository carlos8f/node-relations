{
  var tokenIndex = 0
}

start
  = ret:(
  RoleQuestion
  / RoleRequest
  / Declaration
  / VerbRequest
  / VerbQuestion
  ) {
    if (!ret.object) delete ret.object
    return ret
  }

Declaration "declaration"
  = subject:Token " " pos:( Negative / Positive ) Quantifier? " " role:Token Preposition? object:Obj? "."? {
    return {
      type: pos ? "declaration" : "revocation",
      subject: subject,
      role: role,
      object: object
    }
  }

Revocation "revocation"
  = subject:Token " " Negative " " role:Token Preposition? object:Obj? "."? {
    return {
      type: "revocation",
      subject: subject,
      role: role,
      object: object
    }
  }

VerbQuestion "verb question"
  = "can " subject:Token " " verb:Token Preposition? object:Obj? "?"? {
    return {
      type: "verb-question",
      subject: subject,
      verb: verb,
      object: object
    }
  }

RoleQuestion "role question"
  = Positive " " subject:Token Quantifier? " " role:Token Preposition? object:Obj? "?"? {
    return {
      type: "role-question",
      subject: subject,
      role: role,
      object: object
    }
  }

VerbRequest "verb request"
  = "what can " subject:Token " " verb:Token Preposition? "?"? {
    return {
      type: "verb-request",
      subject: subject,
      verb: verb
    }
  }

RoleRequest "role request"
  = "what " Positive " " subject:Token Quantifier? " " role:Token Preposition? "?"? {
    return {
      type: "role-request",
      subject: subject,
      role: role
    }
  }

Token "token"
  = NamedToken / UnnamedToken / Literal

NamedToken "named token"
  = ":" name:[^ ?]+ {
    return {
      name: name.join("")
    }
  }

UnnamedToken "unnamed token"
  = "%" type:( "s" / "d" ) {
    return {
      type: type === "d" ? "number" : "string",
      index: tokenIndex++
    }
  }

Literal "literal"
  = DoubleQuotedLiteral / SingleQuotedLiteral / UnquotedLiteral

DoubleQuotedLiteral "double-quoted literal"
  = '"' value:[^"]+ '"' {
    return {
      value: value.join("")
    }
  }

SingleQuotedLiteral "single-quoted literal"
  = "'" value:[^']+ "'" {
    return {
      value: value.join("")
    }
  }

UnquotedLiteral "unquoted literal"
  = value:[^ ?]+ {
    return {
      value: value.join("")
    }
  }

Obj "object"
  = " " value:Token {
    return value;
  }

Positive "positive declaration"
  = ( "is" / "are" / "am" ) {
    return true
  }

Quantifier "quantifier"
  = " " ( "an" / "a" / "the" )

Negative "negative declaration"
  = ( "isn't" / "is not" / "are not" / "am not" ) Quantifier? {
    return false
  }

Preposition "preposition"
  = " " ( "of" / "to" / "from" / "in" )
