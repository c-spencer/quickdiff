function innerHTML(a) {
  return a.innerHTML.toLowerCase().replace(/\n|\r/g, '');
}

test("scanDiff", function () {
  var a = $("<div id=\"start\"><div>a</div><div>b</div><div><span>c</span></div></div>");
  equal(a.quickdiff("diff", a).type, "identical", "equal DOMs");
  
  var b = $("<div id=\"start\"><div>a</div><div>ba</div><div><span>c</span></div></div>");
  var res = a.quickdiff("diff", b);
  equal(res.type, "replace", "patch type");
  equal(res.source.length, res.replace.length, "single element change");
  equal(res.source[0].data, "b", "original element");
  equal(res.replace[0].data, "ba", "changed element");
  
  b = $("<div id=\"start\"><div>a</div><div>b</div><div><span>c</span></div><div>d</div></div>");
  res = a.quickdiff("diff", b);
  equal(res.type, "insert", "insert patch type");
  equal(res.source.node.id, "start", "insert parent id");
  equal(res.source.index, 2, "insert index");
  equal(res.source.node.childNodes[res.source.index].innerHTML.toLowerCase(), "<span>c</span>", "insert index element");
  equal(innerHTML(res.replace[0]), "d", "insert new element");
  
  b = $("<div id=\"start\"><div>0</div><div>a</div><div>b</div><div><span>c</span></div></div>");
  res = a.quickdiff("diff", b);
  equal(res.type, "insert", "insert0 patch type");
  equal(res.source.node.id, "start", "insert0 parent id");
  equal(res.source.index, -1, "insert0 index");
  equal(innerHTML(res.replace[0]), "0", "insert0 new element");
  
  var b = $("<div id=\"start\"><div>a</div><div>b</div></div>");
  res = a.quickdiff("diff", b);
  equal(res.type, "replace", "deletion patch type");
  equal(res.source.length, 1, "deletion single element");
  equal(res.replace.length, 0, "deletion no replacement elements");
  equal(innerHTML(res.source[0]), "<span>c</span>", "deletion target");
});

test("scanPatch", function() {
  var origDiv = "<div id=\"start\"><div>a</div><div>b</div><div><span>c</span></div></div>";
  
  var a = $(origDiv);
  a.quickdiff("patch", a);
  equal(innerHTML(a[0]), "<div>a</div><div>b</div><div><span>c</span></div>", "identical doms");
  
  a = $(origDiv);
  var b = $("<div id=\"start\"><div>a</div><div>ba</div><div><span>c</span></div></div>");
  a.quickdiff("patch", b);
  equal(innerHTML(a[0]), "<div>a</div><div>ba</div><div><span>c</span></div>", "single element change");
  
  a = $(origDiv);
  var b = $("<div id=\"start\"><div>a</div><div>b</div><div><span>c</span></div><div>d</div></div>");
  a.quickdiff("patch", b);
  equal(innerHTML(a[0]), "<div>a</div><div>b</div><div><span>c</span></div><div>d</div>", "single element insert end");
  
  a = $(origDiv);
  var b = $("<div id=\"start\"><div>0</div><div>a</div><div>b</div><div><span>c</span></div></div>");
  a.quickdiff("patch", b);
  equal(innerHTML(a[0]), "<div>0</div><div>a</div><div>b</div><div><span>c</span></div>", "single element insert start");
  
  a = $(origDiv);
  var b = $("<div id=\"start\"><div>a</div><div>b</div></div>");
  a.quickdiff("patch", b);
  equal(innerHTML(a[0]), "<div>a</div><div>b</div>", "element deletion");
});

test("filters", function () {
  var origDiv = "<div id=\"start\"><div id=\"test\">a</div><div>b</div><div><span>c</span></div></div>";
  
  $.fn.quickdiff("filter", "spanEqual",
    function (node) { return node.nodeName === "SPAN"; },
    function (a, b) { return false; } );
    
  var a = $(origDiv);
  var b = $("<div id=\"start\"><div id=\"test\">a</div><div>b</div><div><span>change</span></div></div>");
  equal(a.quickdiff("diff", b, ["spanEqual"]).type, "identical", "spans treated as equal");
  
  $.fn.quickdiff("filter", "divEqual",
    function (node) { return node.nodeName === "DIV" && node.id === "test"; },
    function (a, b) { return $(a).text() !== $(b).text(); } );
    
  var a = $(origDiv);
  var b = $("<div id=\"start\"><div id=\"test\"><span>a</span></div><div>b</div><div><span>c</span></div></div>");
  equal(a.quickdiff("diff", b, ["divEqual"]).type, "identical", "div#test compared by textual content");
  
  var a = $(origDiv);
  var b = $("<div id=\"start\"><div id=\"test\"><span>a</span></div><div>b</div><div><span>change</span></div></div>");
  equal(a.quickdiff("diff", b, ["divEqual", "spanEqual"]).type, "identical", "filter combination");
});

test("repeated groups", function () {
  var a = $("<div><p><span class=\"a\"></span></p>");
  var b = $("<div><p><span class=\"a\"></span><span class=\"b\"></span></p></div>");
  
  a.quickdiff("patch", b);
  equal(innerHTML(a[0]), "<p><span class=\"a\"></span><span class=\"b\"></span></p>");
  
  var a = $("<div><p><span class=\"a\"></span>a</p>");
  var b = $("<div><p><span class=\"a\"></span>a<span class=\"b\"></span></p></div>");
  
  a.quickdiff("patch", b);
  equal(innerHTML(a[0]), "<p><span class=\"a\"></span>a<span class=\"b\"></span></p>");
  
  var a = $("<div><p><span class=\"a\"></span>a<span class=\"a\"></span>a</p>");
  var b = $("<div><p><span class=\"a\"></span>a</p></div>");
  
  a.quickdiff("patch", b);
  equal(innerHTML(a[0]), "<p><span class=\"a\"></span>a</p>");
})