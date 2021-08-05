define(['utils'], function (Utils) {
    'use strict';

    /* liste des constantes du framework */

    var labels = {


        vars: {
            errorcolor: {
                "label": (Utils.lang === "en") ? "Error font color" : "Couleur d'erreurs",
                "accesslevel": 2,
                "type": "color"
            },
            warningcolor: {
                "label": (Utils.lang === "en") ? "Warning font color" : "Couleur d'avertissement",
                "accesslevel": 2,
                "type": "color"
            },
            basetextcolor: {
                "label": (Utils.lang === "en") ? "Text Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            linkcolor: {
                "label": (Utils.lang === "en") ? "Link Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            linkcolorvisited: {
                "label": (Utils.lang === "en") ? "Visited Link" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            boxshadowcolor: {
                "label": (Utils.lang === "en") ? "Shadow Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            buttondefaultcolor: {
                "label": (Utils.lang === "en") ? "Button Text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            buttondefaultcolorhover: {
                "label": (Utils.lang === "en") ? "Button Text Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            buttondefaultbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Button background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            buttondefaultbackgroundcolorhover: {
                "label": (Utils.lang === "en") ? "Button background hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            buttondefaultbordercolor: {
                "label": (Utils.lang === "en") ? "Button border" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            buttondefaultbordercolorhover: {
                "label": (Utils.lang === "en") ? "Button border hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            sitemaplinkbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Sitemap Link Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "sitemap"
            },
            sitemapcheckmarkcolor: {
                "label": (Utils.lang === "en") ? "Sitemap checkmark" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "sitemap"
            },
            sitemapcheckmarkbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Sitemap checkmark background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "sitemap"
            },
            modalheadercolor: {
                "label": (Utils.lang === "en") ? "Lightbox Title" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "modal"
            },
            modalheaderbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Lightbox Header background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "modal"
            },
            modalbodybackgroundcolor: {
                "label": (Utils.lang === "en") ? "Lightbox Content Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "modal"
            },
            /*  cardbackgroundcolor: {
                  "label": (Utils.lang === "en") ? "Card Background" : "TRANSLATE",
                  "accesslevel": 2,
                  "type": "color"
              },
              cardbackgroundcolorhover: {
                  "label": (Utils.lang === "en") ? "Card Background Hover" : "TRANSLATE",
                  "accesslevel": 2,
                  "type": "color"
              },
              cardbordercolor: {
                  "label": (Utils.lang === "en") ? "Card Border" : "TRANSLATE",
                  "accesslevel": 2,
                  "type": "color"
              },
              cardtextcolor: {
                  "label": (Utils.lang === "en") ? "Card Text" : "TRANSLATE",
                  "accesslevel": 2,
                  "type": "color"
              },
              cardtextcolorhover: {
                  "label": (Utils.lang === "en") ? "Card Text Hover" : "TRANSLATE",
                  "accesslevel": 2,
                  "type": "color"
              },*/
            footerbuttoncolor: {
                "label": (Utils.lang === "en") ? "Footer Back/Next Text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "backnext"
            },
            footerbuttoncolormobile: {
                "label": (Utils.lang === "en") ? "Footer Back/Next Text (Mobile)" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "backnext"
            },
            footerbuttonbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Footer Back/Next Tackground" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "backnext"
            },
            footerbuttoncolorhover: {
                "label": (Utils.lang === "en") ? "Footer Back/Next Text Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "backnext"
            },
            footerbuttonbackgroundcolorhover: {
                "label": (Utils.lang === "en") ? "Footer Back/Next Background Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "backnext"
            },
            footerpageoftextcolor: {
                "label": (Utils.lang === "en") ? "'Page 1 of 2' Text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            footerpageoftextcolormobile: {
                "label": (Utils.lang === "en") ? "'Page 1 of 2' Text (mobile)" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            footercontainerbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Footer Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            /*footerbuttonbordercolor: {
                "label": (Utils.lang === "en") ? "Lightbox Content Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },*/
            footerbuttoncolordisabled: {
                "label": (Utils.lang === "en") ? "Footer Back/Next text (disabled)" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "backnext"
            },
            footerbuttonbackgroundcolordisabled: {
                "label": (Utils.lang === "en") ? "Footer Back/Next Background (disabled)" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "backnext"
            },
            footermobilebuttonbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Footer Back/Next Mobile Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "footer"
            },
            headerbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Header Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "background-color"
            },
            /*headertextcolor: {
                "label": (Utils.lang === "en") ? "Header Text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "header"
            },*/
            headerbannertitlecolor: {
                "label": (Utils.lang === "en") ? "Title Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            /*headermodulenamecolor: {
                "label": (Utils.lang === "en") ? "Header Module Name" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "header"
            },*/
            headerbuttoncolor: {
                "label": (Utils.lang === "en") ? "Language Toggle Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            headerbuttonbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Toolbar Buttons Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            headerbuttoncolorhover: {
                "label": (Utils.lang === "en") ? "Langauge Toggle Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            headerbuttonbackgroundcolorhover: {
                "label": (Utils.lang === "en") ? "Toolbar Buttons Background Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            topnavtextcolor: {
                "label": (Utils.lang === "en") ? "'1 of 7' Top BackNext Text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "topbacknext"
            },
            topnavbuttoncolor: {
                "label": (Utils.lang === "en") ? "Top BackNext Arrows" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "topbacknext"
            },
            toolbariconcolor: {
                "label": (Utils.lang === "en") ? "Toolbar Icon" : "TRANSLATE",
                "accesslevel": 2,
                "type": "icon",
                "subgroup": "toolbaricons"
            },
            toolbariconcolorhover: {
                "label": (Utils.lang === "en") ? "Toolbar Icon Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "toolbaricons"
            },
            topnavbuttoncolormobile: {
                "label": (Utils.lang === "en") ? "Mobile Top Navigation Button Text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "mobileonly"
            },
            topnavbuttonbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Mobile Top Navigation Button Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "mobileonly"
            },
            hamburgermenucolormobile: {
                "label": (Utils.lang === "en") ? "Hamburger Menu" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "mobileonly"
            },
            toolboxlinkcolor: {
                "label": (Utils.lang === "en") ? "Toolbox Text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "toolbox"
            },
            toolboxlinkbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Toolbox Background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "background-color",
                "subgroup": "toolbox"
            },
            toolboxlinkcolorhover: {
                "label": (Utils.lang === "en") ? "Toolbox Text Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "toolbox"
            },
            toolboxlinkbackgroundcolorhover: {
                "label": (Utils.lang === "en") ? "Toolbox Background Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "toolbox"
            },
            supermenubuttoncolor: {
                "label": (Utils.lang === "en") ? "Supermenu Button text" : "TRANSLATE",
                "accesslevel": 2
            },
            supermenubuttonbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Supermenu Button background" : "TRANSLATE",
                "accesslevel": 2
            },
            supermenubuttoncolorhover: {
                "label": (Utils.lang === "en") ? "Supermenu Button text Hover" : "TRANSLATE",
                "accesslevel": 2
            },
            supermenubuttonbackgroundcolorhover: {
                "label": (Utils.lang === "en") ? "Supermenu Button background hover" : "TRANSLATE",
                "accesslevel": 2
            },
            supermenudropdownbuttoncolor: {
                "label": (Utils.lang === "en") ? "Dropdown Button text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "dropdown"
            },
            supermenudropdownbordercolor: {
                "label": (Utils.lang === "en") ? "Dropdown border" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "dropdown"
            },
            supermenudropdownbuttonbackgroundcolor: {
                "label": (Utils.lang === "en") ? "Dropdown Button background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "dropdown"
            },
            supermenudropdownbuttoncolorhover: {
                "label": (Utils.lang === "en") ? "Dropdown Button text hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "dropdown"
            },
            supermenudropdownbuttonbackgroundcolorhover: {
                "label": (Utils.lang === "en") ? "Dropdown Button background hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "dropdown"
            },
            supermenulinkcolor: {
                "label": (Utils.lang === "en") ? "mobile supermenu text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "mobileonly"
            },
            supermenudropdowniconscolor: {
                "label": (Utils.lang === "en") ? "Supermenu Dropdown Icon" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "icons"
            },
            supermenudropdowniconscolorhover: {
                "label": (Utils.lang === "en") ? "Supermenu Dropdown Icon Hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "icons"
            },
            btniconcolor: {
                "label": (Utils.lang === "en") ? "Button Icon" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            btniconcolorhover: {
                "label": (Utils.lang === "en") ? "Button Icon hover" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            defaulticoncolor: {
                "label": (Utils.lang === "en") ? "Default Icon Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            defaulticonbgcolor: {
                "label": (Utils.lang === "en") ? "default icon background color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color"
            },
            ribboncolor: {
                "label": (Utils.lang === "en") ? "ribbon text" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "ribbon"
            },
            ribbonbgcolor: {
                "label": (Utils.lang === "en") ? "ribbon background" : "TRANSLATE",
                "accesslevel": 2,
                "type": "background-color",
                "subgroup": "ribbons"
            },
            iconboxcolor: {
                "label": (Utils.lang === "en") ? "Iconbox Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "color",
                "subgroup": "iconboxs"
            },
            iconboxbgcolor: {
                "label": (Utils.lang === "en") ? "Iconbox Background Color" : "TRANSLATE",
                "accesslevel": 2,
                "type": "border-color",
                "subgroup": "iconbox"
            }




        },






        colorwords: {

            "aliceblue": "#F0F8FF",
            "antiquewhite": "#FAEBD7",
            "aqua": "#00FFFF",
            "aquamarine": "#7FFFD4",
            "azure": "#F0FFFF",
            "beige": "#F5F5DC",
            "bisque": "#FFE4C4",
            "black": "#000000",
            "blanchedalmond": "#FFEBCD",
            "blue": "#0000FF",
            "blueviolet": "#8A2BE2",
            "brown": "#A52A2A",
            "burlywood": "#DEB887",
            "cadetblue": "#5F9EA0",
            "chartreuse": "#7FFF00",
            "chocolate": "#D2691E",
            "coral": "#FF7F50",
            "cornflowerblue": "#6495ED",
            "cornsilk": "#FFF8DC",
            "crimson": "#DC143C",
            "cyan": "#00FFFF",
            "darkblue": "#00008B",
            "darkcyan": "#008B8B",
            "darkgoldenrod": "#B8860B",
            "darkgray": "#A9A9A9",
            "darkgrey": "#A9A9A9",
            "darkgreen": "#006400",
            "darkkhaki": "#BDB76B",
            "darkmagenta": "#8B008B",
            "darkolivegreen": "#556B2F",
            "darkorange": "#FF8C00",
            "darkorchid": "#9932CC",
            "darkred": "#8B0000",
            "darksalmon": "#E9967A",
            "darkseagreen": "#8FBC8F",
            "darkslateblue": "#483D8B",
            "darkslategray": "#2F4F4F",
            "darkslategrey": "#2F4F4F",
            "darkturquoise": "#00CED1",
            "darkviolet": "#9400D3",
            "deeppink": "#FF1493",
            "deepskyblue": "#00BFFF",
            "dimgray": "#696969",
            "dimgrey": "#696969",
            "dodgerblue": "#1E90FF",
            "firebrick": "#B22222",
            "floralwhite": "#FFFAF0",
            "forestgreen": "#228B22",
            "fuchsia": "#FF00FF",
            "gainsboro": "#DCDCDC",
            "ghostwhite": "#F8F8FF",
            "gold": "#FFD700",
            "goldenrod": "#DAA520",
            "gray": "#808080",
            "grey": "#808080",
            "green": "#008000",
            "greenyellow": "#ADFF2F",
            "honeydew": "#F0FFF0",
            "hotpink": "#FF69B4",
            "indianred": "#CD5C5C",
            "indigo": "#4B0082",
            "ivory": "#FFFFF0",
            "khaki": "#F0E68C",
            "lavender": "#E6E6FA",
            "lavenderblush": "#FFF0F5",
            "lawngreen": "#7CFC00",
            "lemonchiffon": "#FFFACD",
            "lightblue": "#ADD8E6",
            "lightcoral": "#F08080",
            "lightcyan": "#E0FFFF",
            "lightgoldenrodyellow": "#FAFAD2",
            "lightgray": "#D3D3D3",
            "lightgrey": "#D3D3D3",
            "lightgreen": "#90EE90",
            "lightpink": "#FFB6C1",
            "lightsalmon": "#FFA07A",
            "lightseagreen": "#20B2AA",
            "lightskyblue": "#87CEFA",
            "lightslategray": "#778899",
            "lightslategrey": "#778899",
            "lightsteelblue": "#B0C4DE",
            "lightyellow": "#FFFFE0",
            "lime": "#00FF00",
            "limegreen": "#32CD32",
            "linen": "#FAF0E6",
            "magenta": "#FF00FF",
            "maroon": "#800000",
            "mediumaquamarine": "#66CDAA",
            "mediumblue": "#0000CD",
            "mediumorchid": "#BA55D3",
            "mediumpurple": "#9370DB",
            "mediumseagreen": "#3CB371",
            "mediumslateblue": "#7B68EE",
            "mediumspringgreen": "#00FA9A",
            "mediumturquoise": "#48D1CC",
            "mediumvioletred": "#C71585",
            "midnightblue": "#191970",
            "mintcream": "#F5FFFA",
            "mistyrose": "#FFE4E1",
            "moccasin": "#FFE4B5",
            "navajowhite": "#FFDEAD",
            "navy": "#000080",
            "oldlace": "#FDF5E6",
            "olive": "#808000",
            "olivedrab": "#6B8E23",
            "orange": "#FFA500",
            "orangered": "#FF4500",
            "orchid": "#DA70D6",
            "palegoldenrod": "#EEE8AA",
            "palegreen": "#98FB98",
            "paleturquoise": "#AFEEEE",
            "palevioletred": "#DB7093",
            "papayawhip": "#FFEFD5",
            "peachpuff": "#FFDAB9",
            "peru": "#CD853F",
            "pink": "#FFC0CB",
            "plum": "#DDA0DD",
            "powderblue": "#B0E0E6",
            "purple": "#800080",
            "rebeccapurple": "#663399",
            "red": "#FF0000",
            "rosybrown": "#BC8F8F",
            "royalblue": "#4169E1",
            "saddlebrown": "#8B4513",
            "salmon": "#FA8072",
            "sandybrown": "#F4A460",
            "seagreen": "#2E8B57",
            "seashell": "#FFF5EE",
            "sienna": "#A0522D",
            "silver": "#C0C0C0",
            "skyblue": "#87CEEB",
            "slateblue": "#6A5ACD",
            "slategray": "#708090",
            "slategrey": "#708090",
            "snow": "#FFFAFA",
            "springgreen": "#00FF7F",
            "steelblue": "#4682B4",
            "tan": "#D2B48C",
            "teal": "#008080",
            "thistle": "#D8BFD8",
            "tomato": "#FF6347",
            "turquoise": "#40E0D0",
            "violet": "#EE82EE",
            "wheat": "#F5DEB3",
            "white": "#FFFFFF",
            "whitesmoke": "#F5F5F5",
            "yellow": "#FFFF00",
            "yellowgreen": "#9ACD32"

        },
        "icons": {
            "home": {
                "firstPart": "url(\"data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 199 191'%3E%3Cpath d='M196.81,69.39,105.5,3.05a8.8,8.8,0,0,0-10.34,0L3.85,69.39C2.39,70.78,1,72,1,78.81V186.58c.28,4,2.36,5.79,6.17,5.79H70V128.72a9.92,9.92,0,0,1,9.89-9.89h41.14a9.92,9.92,0,0,1,9.89,9.89v63.65h62.66c3.81,0,5.75-2.57,6.18-6.07L200,79.22C199.8,73.73,199.89,71.63,196.81,69.39Z' transform='translate(-1 -1.37)' fill='",
                "lastPart": "'/%3E%3C/svg%3E\")"
            },
            "toolbox": {
                "firstPart": "url(\"data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 197.49 160.33'%3E%3Cdefs%3E%3Cstyle%3E.a%7Bfill:",
                "lastPart": ";%7D%3C/style%3E%3C/defs%3E%3Cpath class='a' d='M198.45,59.74c-.39-6.7-.11-13.45-.06-20.17s-2.45-9.92-8.27-9.9c-18.3,0-36.59,0-54.88,0,.79-19-6.62-28.56-21.87-28.62-9.49,0-19-.11-28.47.05-14.59.24-22.35,11.34-20.39,28.57-18.4,0-36.8,0-55.21,0-5.9,0-8.21,3.38-8.18,10,0,6.47.28,13-.08,19.43-.32,5.77,1.13,7.7,6.17,7.66h3c0,29.52-.06,67.61,0,86.1,0,6.9,1.72,8.43,8.93,8.43q80.21,0,160.44,0c8.48,0,9.74-1.34,9.76-10.24,0-17.69,0-55.7,0-84.31h3.05C196.76,66.79,198.81,65.6,198.45,59.74ZM83.35,16.25c10.93-.29,21.86-.16,32.8-.06,4.42,0,6.8,3,7.09,8.37.1,1.64.2,3.33.31,5.11H76C76.35,23.24,75.86,16.45,83.35,16.25Z' transform='translate(-1 -1)'/%3E%3C/svg%3E\")"
            },
            "sitemap": {
                "firstPart": "url(\"data:image/svg+xml, %3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 174.75'%3E%3Cdefs%3E%3Cstyle%3E.a%7Bfill:",
                "lastPart": ";%7D%3C/style%3E%3C/defs%3E%3Cpath class='a' d='M192.42,120.18H178.89V92.8a9.15,9.15,0,0,0-9.14-9.13H106.23V54.57h13.91A7.61,7.61,0,0,0,127.73,47V7.58A7.61,7.61,0,0,0,120.14,0H80.74a7.6,7.6,0,0,0-7.58,7.58V47a7.6,7.6,0,0,0,7.58,7.58H93.89v29.1H30.25a9.14,9.14,0,0,0-9.13,9.13v27.38H7.58A7.6,7.6,0,0,0,0,127.76v39.41a7.6,7.6,0,0,0,7.58,7.58H47a7.6,7.6,0,0,0,7.58-7.58V127.76A7.6,7.6,0,0,0,47,120.18H33.46V96H93.89v24.17H80.3a7.6,7.6,0,0,0-7.58,7.58v39.41a7.6,7.6,0,0,0,7.58,7.58h39.4a7.6,7.6,0,0,0,7.58-7.58V127.76a7.6,7.6,0,0,0-7.58-7.58H106.23V96h60.31v24.17H153a7.6,7.6,0,0,0-7.58,7.58v39.41a7.6,7.6,0,0,0,7.58,7.58h39.41a7.6,7.6,0,0,0,7.58-7.58V127.76A7.6,7.6,0,0,0,192.42,120.18Z'/%3E%3C/svg%3E\")"
            }
        }
    }
    return labels;
});
