// https://gist.github.com/kevinyan815/f71b2f5ca3541631abd2e50f3929739b

function toBaseN(num, base) {
    if (num === 0) {
      return '0';
    }
    var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var len = Math.min(digits.length, base);
    var result = ''; 
    while (num > 0) {
      result = digits[num % len] + result;
      num = parseInt(num / len, 10);
    }
    
    return result;
  }
  
  function fromBaseN(str, base) {
    if (str === null || str.length === 0) {
      return 0;
    }
    var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var len = Math.min(digits.length, base);
    var result = 0;
    for (var i=0 ; i<str.length ; i++) {
      var p = digits.indexOf(str[i]);
      if (p < 0 || p >= base) {
        return NaN;
      }
      result += p * Math.pow(digits.length, str.length - i - 1);
    }
    return result;
  }
  
  function toBase62(n) {
    if (n === 0) {
      return '0';
    }
    var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = ''; 
    while (n > 0) {
      result = digits[n % digits.length] + result;
      n = parseInt(n / digits.length, 10);
    }
    
    return result;
  }
  
  function fromBase62(s) {
    var digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = 0;
    for (var i=0 ; i<s.length ; i++) {
      var p = digits.indexOf(s[i]);
      if (p < 0) {
        return NaN;
      }
      result += p * Math.pow(digits.length, s.length - i - 1);
    }
    return result;
  }