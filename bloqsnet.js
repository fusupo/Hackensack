var BLOQS_MANIFEST = [
    "root",
    "circle",
    "text",
    "image"
];

var DATA = {
    "bloqs": {
        "b1": {
            id: "b1",
            type: "root",
            meta: {
                x: 10,
                y: 10
            },
            params: {
                width: "100%",
                height: "100%"
            },
            p:[],
            c:["b2", "b3", "b4", "b5"]
        },
        "b2": {
            id: "b2",
            type: "rect",
            meta: {
                x: 20,
                y: 10},
            params: {
                width: 50,
                height: 50,
                x: 10,
                y: 20,
                style: "fill: #ff0f67"
            },
            p:["b1"],
            c:[]
        },
        "b3": {
            id: "b3",
            type: "circle",
            meta: {
                x: 30,
                y: 10
            },
            params: {
                x: 35,
                y: 100,
                r: 25,
                style: "fill: $990f67"
            },
            p:["b1"],
            c:[]
        },
        "b4": {
            id: "b4",
            type: "text",
            meta: {
                x: 40,
                y:10
            },
            params: {
                x: 10,
                y: 60,
                font: "Lobster",
                text: "SOmeo ther text here"
            },
            p:["b1"],
            c:[]
        },
        "b5": {
            id: "b5",
            type: "image",
            meta: {
                x: 50,
                y: 10
            },
            params: {
                x: 1,
                y: 1,
                width: 300,
                height: 200,
                src: "",
                aspect: "xMaxYMin meet"
            },
            p:["b1"],
            c:[]
        }
    }
};
