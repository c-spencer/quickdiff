# quickdiff

quickdiff is a tool for partially updating a live DOM to match a new DOM. It was designed for providing live previews for markdown without redrawing the entire preview each time, and coping with possible transformations that have been applied to the live DOM.

## use

quickdiff is provided as a jQuery extension, but the core functions are framework independent.

    $(element).quickdiff("diff", $(target), filters);
    
    $(element).quickdiff("patch", $(target), filters);
    
Filters is an optional array of filters to use (more on that later). The `diff` call returns a patch difference between element and target. A patch is of the form:

    {
      type: "identical" | "replace" | "insert",
      source: [elements] | {node, index},
      replace: [elements],
      patch: function () { ... }
    }
    
For `replace` operations, the source will be a set of elements, otherwise it will contain a parent node and the index inside that node at which to insert. The `replace` property for both replace and insert methods contains the array of new elements. If you call quickdiff with `diff` then the patch will have a function attached which will execute the patch upon the source. Calling with `patch` will patch the element and return the patch that was used.

Actual patch application is provided, so ordinarily this patch information is used to process removed or added elements.

## filters

Filters are used to change how some kinds of DOM nodes are compared.

    $.fn.quickdiff("filter", name, condition, equality)
    
Filters are added on the prototype, and assigned a name, with condition and equality callbacks. Condition takes a single node as argument and returns whether this filter applies to that node. Equality is given two nodes (old, new) and returns whether they are different. As an example, the following filter treats all spans as equal:

    $.fn.quickdiff("filter", "spanEqual",
      function (node) { return node.nodeName === "SPAN"; },
      function (a, b) { return false; });