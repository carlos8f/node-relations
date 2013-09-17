{
  var tokenIndex = 0
}

start
  = ret:(
  ObjectVerbRequest
  / RoleSubjectRequest
  / VerbSubjectRequest
  / RoleQuestion
  / RoleRequest
  / Declaration
  / Revocation
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
  = "can "i subject:Token " " verb:Token Preposition? object:Obj? "?"? {
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
  = "what can "i subject:Token " " verb:Token Preposition? "?"? {
    return {
      type: "verb-request",
      subject: subject,
      verb: verb
    }
  }

RoleRequest "role request"
  = "what "i Positive " " subject:Token Quantifier? " " role:Token Preposition? "?"? {
    return {
      type: "role-request",
      subject: subject,
      role: role
    }
  }

VerbSubjectRequest "verb subject request"
  = "who can "i verb:Token Preposition? " " object:Token "?"? {
    return {
      type: "verb-subject-request",
      object: object,
      verb: verb
    }
  }

RoleSubjectRequest "role subject request"
  = "who "i Positive Quantifier? " " role:Token Preposition? " " object:Token "?"? {
    return {
      type: "role-subject-request",
      object: object,
      role: role
    }
  }

ObjectVerbRequest "object verb request"
  = "what actions can "i subject:Token " do"i Preposition " " object:Token "?"? {
    return {
      type: "object-verb-request",
      subject: subject,
      object: object
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
  = ( "is"i / "are"i / "am"i ) {
    return true
  }

Quantifier "quantifier"
  = " " ( "an"i / "a"i / "the"i )

Negative "negative declaration"
  = ( "isn't"i / "is not"i / "are not"i / "am not"i ) Quantifier? {
    return false
  }

Preposition "preposition"
  = " " ( "of"i / "to"i / "from"i / "in"i / "with"i )
