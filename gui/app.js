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
                'sevicedoc': null,
                'apidocLoaded': false,
                'sevicedocLoaded': false,
                'data': {'api': [], 'sevice': []}
            },
            'client': {
                'apidoc': null,
                'sevicedoc': 'http://user-doc.lalafo.loc/service-doc.php',
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
                reject();
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
                    $(go.Shape,
                        {
                            name: "SHAPE",
                            fill: UnselectedBrush, stroke: "gray",
                            geometryString: "F1 m 0,0 l 5,0 1,4 -1,4 -5,0 1,-4 -1,-4 z",
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

            myDiagram.nodeTemplate =
                $(go.Node, "Spot",
                    {selectionAdorned: false},
                    {locationSpot: go.Spot.Center, locationObjectName: "BODY"},
                    new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                    $(go.Panel, "Auto",
                        {name: "BODY"},
                        $(go.Shape, "RoundedRectangle",
                            {stroke: "gray", strokeWidth: 2, fill: "transparent"},
                            new go.Binding("stroke", "isSelected", function(b) {
                                return b ? SelectedBrush : UnselectedBrush;
                            }).ofObject()),
                        $(go.Panel, "Vertical",
                            {margin: 6},
                            $(go.TextBlock,
                                new go.Binding("text", "name"),
                                {alignment: go.Spot.Left}),
                            $(go.Picture, "images/la.png",
                                {width: 30, height: 45, margin: new go.Margin(10, 10)})
                        )
                    ),
                    $(go.Panel, "Vertical",
                        { desiredSize: new go.Size(300, 150) },
                        {name: "LEFTPORTS", alignment: new go.Spot(0, 0.5, 0, 7)},
                        new go.Binding("itemArray", "inservices"),
                        {itemTemplate: makeItemTemplate(true)}
                    ),
                    $(go.Panel, "Vertical",
                        {name: "RIGHTPORTS", alignment: new go.Spot(1, 0.5, 0, 7)},
                        new go.Binding("itemArray", "outservices"),
                        {itemTemplate: makeItemTemplate(false)}
                    )
                );
            myDiagram.linkTemplate =
                $(go.Link,
                    {routing: go.Link.Orthogonal, corner: 10, toShortLength: -3},
                    {relinkableFrom: true, relinkableTo: true, reshapable: true, resegmentable: true},
                    $(go.Shape, {stroke: "gray", strokeWidth: 2.5})
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
                {key: 2, name: "Other", inservices: [{name: "s1"}, {name: "s2"}], loc: "200 60"}
            ];


            var t = this;

            var id = 0;
            Object.keys(this.sources).forEach(function(key) {
                id++;


                var inservices = [{name: "s1"}, {name: "s2"}];
                var outservices = [{name: "o1"}];

                services.push(
                    {key: id, name: key, inservices: inservices, outservices: outservices, loc: "0 0"},
                );


                jQuery.each(t.sources[key].data.api, function(path, val) {
                    console.log(path, val);

                   inservices.push({name: path});

                });


                // t.sources[key].data.sevice.forEach(function(item) {
                //     console.log(item)
                // })

//                console.log('api', t.sources[key].data.api);
//                console.log('sevice', t.sources[key].data.sevice);


            });

            myDiagram.model =
                $(go.GraphLinksModel,
                    {
                        copiesArrays: true,
                        copiesArrayObjects: true,
                        linkFromPortIdProperty: "fromPort",
                        linkToPortIdProperty: "toPort",
                        nodeDataArray: services,
                        linkDataArray: [
                            {from: 1, fromPort: "o1", to: 2, toPort: "s2"}
                        ]
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
            t.drawMap()
        });

    }
})