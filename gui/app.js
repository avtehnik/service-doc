var app = new Vue({
    el: '#app',
    data: {

        message: 'Hello Vue!',
        sources: {
            'payment': {
                'apidoc': 'http://payment-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': 'http://payment-doc.lalafo.loc/service-doc.php',
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'calaog': {
                'apidoc': 'http://catalog-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': 'http://calaog-doc.lalafo.loc/service-doc.php',
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'client': {
                'apidoc': null,
                'sevicedoc': 'http://client-doc.lalafo.loc/service-doc.php',
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'seo': {
                'apidoc': null,
                'sevicedoc': 'http://seo-doc.lalafo.loc/service-doc.php',
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'location': {
                'apidoc': 'http://location-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': null,
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'search': {
                'apidoc': 'http://search-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': 'http://search-doc.lalafo.loc/service-doc.php',
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'translation': {
                'apidoc': 'http://translation-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': null,
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'sender': {
                'apidoc': 'http://sender-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': null,
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'duplicates': {
                'apidoc': 'http://duplicates-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': null,
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'fraud': {
                'apidoc': 'http://fraud-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': null,
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'user': {
                'apidoc': 'http://user-develop.kube-two.yallasvc.net/documentation/api',
                'sevicedoc': 'http://user-doc.lalafo.loc/service-doc.php',
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            }
        },
        loadedData: []
    },
    computed: {
        isLoaded() {
            return 'badge badge-danger';
        }
    },
    methods: {
        loadDocFor(service, type, url, resolve, reject) {
            var t = this;
            console.log(service, type, url);
            jQuery.getJSON(url, function(data) {
                t.sources[service]['data'][type] = data;
                if (type == 'api') {
                    t.sources[service].apidocLoaded = true;
                    t.sources[service].data[type] = data.paths
                } else if (type == 'sevice') {
                    t.sources[service].sevicedocLoaded = true;
                    t.sources[service].data[type] = data.paths
                }


                resolve();
            }).fail(function() {
                resolve();
                console.log('reject', service, url);
            });
        },
        drawMap() {
            console.log('drawMap');
            var $ = go.GraphObject.make;
            var myDiagram =
                $(go.Diagram, "myDiagramDiv",
                    {
                        // For this sample, automatically show the state of the diagram's model on the page
                        "ModelChanged": function(e) {
                            if (e.isTransactionFinished) showModel();
                        },
                        layout: $(go.LayeredDigraphLayout),
                        "undoManager.isEnabled": true
                    });
            var UnselectedBrush = "lightgray";  // item appearance, if not "selected"
            var SelectedBrush = "dodgerblue";   // item appearance, if "selected"

            function makeItemTemplate(leftside) {
                return $(go.Panel, "Auto",
                    {margin: new go.Margin(1, 0)},  // some space between ports
                    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                    $(go.Shape,
                        {
                            name: "SHAPE",
                            fill: UnselectedBrush, stroke: "gray",
                            // geometryString: "F1 m 0,0 l 5,0 1,4 -1,4 -5,0 1,-4 -1,-4 z",
                            spot1: new go.Spot(0, 0, 5, 1),  // keep the text inside the shape
                            spot2: new go.Spot(1, 1, -5, 0),
                            // some port-related properties
                            toSpot: go.Spot.Left,
                            toLinkable: leftside,
                            fromSpot: go.Spot.Right,
                            fromLinkable: !leftside,
                            cursor: "pointer"
                        },
                        new go.Binding("portId", "name")),
                    $(go.TextBlock,
                        new go.Binding("text", "name"),
                        { // allow the user to select items -- the background color indicates whether "selected"
                            isActionable: true,
                            //?? maybe this should be more sophisticated than simple toggling of selection
                            click: function(e, tb) {
                                var shape = tb.panel.findObject("SHAPE");
                                if (shape !== null) {
                                    // don't record item selection changes
                                    var oldskips = shape.diagram.skipsUndoManager;
                                    shape.diagram.skipsUndoManager = true;
                                    // toggle the Shape.fill
                                    if (shape.fill === UnselectedBrush) {
                                        shape.fill = SelectedBrush;
                                    } else {
                                        shape.fill = UnselectedBrush;
                                    }
                                    shape.diagram.skipsUndoManager = oldskips;
                                }
                            }
                        })
                );
            }

            var fieldTemplateLeft =
                $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
                    new go.Binding("portId", "name"),  // this Panel is a "port"
                    {
                        background: "transparent",  // so this port's background can be picked by the mouse
                        fromSpot: go.Spot.Right,  // links only go from the right side to the left side
                        toSpot: go.Spot.Left,
                        // allow drawing links from or to this port:
                        fromLinkable: true, toLinkable: true
                    },

                    $(go.Shape,
                        {
                            name: "SHAPE",
                            column: 1,
                            minSize: new go.Size(15, 10),
                            fill: UnselectedBrush,
                            stroke: "gray",
                            geometryString: "F1 m 0,0 l 5,0 1,4 -1,4 -5,0 1,-4 -1,-4 z",
                        },
                        new go.Binding("fill", "isSelected", function(s) {
                            return s ? SelectedBrush : UnselectedBrush;
                        }).ofObject(),
                        new go.Binding("toLinkable", "_in"),
                        new go.Binding("fromLinkable", "_in", function(b) {
                            return !b;
                        })),

                    $(go.TextBlock,
                        {
                            margin: new go.Margin(0, 5), column: 2, font: "bold 13px sans-serif",
                            alignment: go.Spot.Left,
                            // and disallow drawing links from or to this text:
                            fromLinkable: false, toLinkable: false
                        },
                        new go.Binding("text", "operationId")),
                    $(go.TextBlock,
                        {margin: new go.Margin(0, 5), column: 3, font: "13px sans-serif", alignment: go.Spot.Left},
                        new go.Binding("text", "name")),
                    $(go.TextBlock,
                        {margin: new go.Margin(0, 5), column: 4, font: "13px sans-serif", alignment: go.Spot.Left},
                        new go.Binding("text", "info"))
                );

            var fieldTemplateRight =
                $(go.Panel, "TableRow",  // this Panel is a row in the containing Table
                    new go.Binding("portId", "operationId"),  // this Panel is a "port"
                    {
                        background: "transparent",  // so this port's background can be picked by the mouse
                        fromSpot: go.Spot.Right,  // links only go from the right side to the left side
                        toSpot: go.Spot.Left,
                        // allow drawing links from or to this port:
                        fromLinkable: true, toLinkable: false
                    },
                    $(go.TextBlock,
                        {
                            margin: new go.Margin(0, 5), column: 1, font: "bold 13px sans-serif",
                            alignment: go.Spot.Left,
                            // and disallow drawing links from or to this text:
                            fromLinkable: false, toLinkable: false
                        },
                        new go.Binding("text", "operationId")),
                    $(go.TextBlock,
                        {margin: new go.Margin(0, 5), column: 2, font: "13px sans-serif", alignment: go.Spot.Left},
                        new go.Binding("text", "name")),
                    $(go.TextBlock,
                        {margin: new go.Margin(0, 5), column: 3, font: "13px sans-serif", alignment: go.Spot.Left},
                        new go.Binding("text", "info")),
                    $(go.Shape,
                        {
                            column: 4,
                            name: "SHAPE",
                            minSize: new go.Size(15, 10),
                            fill: "green",
                            stroke: "gray",
                            geometryString: "F1 m 0,0 l 5,0 1,4 -1,4 -5,0 1,-4 -1,-4 z"
                        },
                        new go.Binding("fill", "isSelected", function(s) {
                            return s ? SelectedBrush : UnselectedBrush;
                        }).ofObject()
                    )
                );

            myDiagram.nodeTemplate =
                $(go.Node, "Auto",
                    {copyable: false, deletable: false},
                    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                    // this rectangular shape surrounds the content of the node
                    $(go.Shape,
                        {fill: "#EEEEEE"}),
                    // the content consists of a header and a list of items
                    $(go.Panel, "Vertical",
                        $(go.Panel, "Auto",
                            {stretch: go.GraphObject.Horizontal},  // as wide as the whole node
                            $(go.Shape,
                                {fill: "#1570A6", stroke: null}),

                            $(go.TextBlock,
                                {
                                    alignment: go.Spot.Center,
                                    margin: 3,
                                    stroke: "white",
                                    textAlign: "center",
                                    font: "bold 12pt sans-serif",
                                    click: function(e, obj) {
                                        window.open(obj.part.data.url.replace('/api',''));
                                    }
                                },
                                new go.Binding("text", "name"))),


                        $(go.Panel, "Horizontal",
                            $(go.Panel, "Table",
                                {
                                    padding: 2,
                                    minSize: new go.Size(100, 10),
                                    defaultStretch: go.GraphObject.Horizontal,
                                    itemTemplate: fieldTemplateLeft
                                },
                                new go.Binding("itemArray", "inservices")
                            ),
                            $(go.Panel, "Table",
                                {
                                    padding: 2,
                                    minSize: new go.Size(100, 10),
                                    defaultStretch: go.GraphObject.Horizontal,
                                    itemTemplate: fieldTemplateRight
                                },
                                new go.Binding("itemArray", "outservices")
                            )
                        ),
                    )
                );


            myDiagram.linkTemplate =
                $(go.Link,
                    {routing: go.Link.Orthogonal, corner: 10, toShortLength: -3},
                    {relinkableFrom: true, relinkableTo: true, reshapable: true, resegmentable: true},
                    $(go.Shape, {stroke: "gray", strokeWidth: 2.5}),
                    $(go.Shape,  // the arrowhead
                        {toArrow: "standard", stroke: null}),
                );

            function findAllSelectedItems() {
                var items = [];
                for (var nit = myDiagram.nodes; nit.next();) {
                    var node = nit.value;
                    //?? Maybe this should only return selected items that are within selected Nodes
                    //if (!node.isSelected) continue;
                    var table = node.findObject("LEFTPORTS");
                    if (table !== null) {
                        for (var iit = table.elements; iit.next();) {
                            var itempanel = iit.value;
                            var shape = itempanel.findObject("SHAPE");
                            if (shape !== null && shape.fill === SelectedBrush) items.push(itempanel);
                        }
                    }
                    table = node.findObject("RIGHTPORTS");
                    if (table !== null) {
                        for (var iit = table.elements; iit.next();) {
                            var itempanel = iit.value;
                            var shape = itempanel.findObject("SHAPE");
                            if (shape !== null && shape.fill === SelectedBrush) items.push(itempanel);
                        }
                    }
                }
                return items;
            }

            // Override the standard CommandHandler deleteSelection and canDeleteSelection behavior.
            // If there are any selected items, delete them instead of deleting any selected nodes or links.
            myDiagram.commandHandler.canDeleteSelection = function() {
                // true if there are any selected deletable nodes or links,
                // or if there are any selected items within nodes
                return go.CommandHandler.prototype.canDeleteSelection.call(myDiagram.commandHandler) ||
                    findAllSelectedItems().length > 0;
            };
            myDiagram.commandHandler.deleteSelection = function() {
                var items = findAllSelectedItems();
                if (items.length > 0) {  // if there are any selected items, delete them
                    myDiagram.startTransaction("delete items");
                    for (var i = 0; i < items.length; i++) {
                        var item = items[i];
                        var nodedata = item.part.data;
                        var itemdata = item.data;
                        // find the item array that the item data is in; try "inservices" first
                        var itemarray = nodedata.inservices;
                        var itemindex = itemarray.indexOf(itemdata);
                        if (itemindex < 0) {  // otherwise try "outservices"
                            itemarray = nodedata.outservices;
                            itemindex = itemarray.indexOf(itemdata);
                        }
                        if (itemindex >= 0) {
                            myDiagram.model.removeArrayItem(itemarray, itemindex);
                        }
                    }
                    myDiagram.commitTransaction("delete items");
                } else {  // otherwise just delete nodes and/or links, as usual
                    go.CommandHandler.prototype.deleteSelection.call(myDiagram.commandHandler);
                }
            };


            var services = [
                // {key: "test", name: "Other", inservices: [{name: "s1"}, {name: "s2"}], loc: "200 60"}
            ];


            var t = this;
            var links = [
                //   {from: 1, fromPort: "o1o1o1", to: 2, toPort: "s1"}
            ];

            var id = 0;
            Object.keys(this.sources).forEach(function(key) {
                id++;


                var inservices = [];
                var outservices = [
                    //{name: "o1o1o1"}
                ];

                jQuery.each(t.sources[key].data.api, function(path, val) {
                    console.log(key, path);
                    inservices.push({name: path, operationId: Object.keys(val).join(',')});
                });

                jQuery.each(t.sources[key].data.sevice, function(path, val) {

                    outservices.push({name: val.path , operationId: val.operationId});
                    links.push({from: key, fromPort: val.operationId, to: val.microservice, toPort: val.path, operationId: val.operationId})
                    //links.push({from: key, fromPort: val.path, to: val.microservice, toPort: val.path, operationId: val.operationId})

                });

                console.log(t.sources[key].apidoc);
                services.push(

                    {key: key, name: key, inservices: inservices, outservices: outservices,url:t.sources[key].apidoc},
                );


                // t.sources[key].data.sevice.forEach(function(item) {
                //     console.log(item)
                // })

//                console.log('api', t.sources[key].data.api);
//                console.log('sevice', t.sources[key].data.sevice);


            });
            console.log(links);

            myDiagram.model =
                $(go.GraphLinksModel,
                    {
                        copiesArrays: true,
                        copiesArrayObjects: true,
                        linkFromPortIdProperty: "fromPort",
                        linkToPortIdProperty: "toPort",
                        nodeDataArray: services,
                        linkDataArray: links
                    });
            showModel();

            function showModel() {
                //s    document.getElementById("mySavedModel").value = myDiagram.model.toJson();
            }

        }
    },
    mounted() {

        var t = this;

        var requests = [];

        Object.keys(this.sources).forEach(function(key) {

            if (t.sources[key].apidoc) {
                requests.push(new Promise((resolve, reject) => {
                    t.loadDocFor(key, 'api', t.sources[key].apidoc, resolve, reject);
                }));
            }
            if (t.sources[key].sevicedoc) {
                requests.push(new Promise((resolve, reject) => {
                    t.loadDocFor(key, 'sevice', t.sources[key].sevicedoc, resolve, reject);
                }));
            }
        });

        console.log(requests);
        Promise.all(requests).then(function() {
            console.log('loaded------------------------------------------------');
            t.drawMap()
        }).catch(function(err) {
            console.log('errr------------------------------------------------');
//            t.drawMap()
        });

    }
})