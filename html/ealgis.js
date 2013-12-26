
/* EAlGIS: main client javascript program */
$(function() {
    var user_info;
    var user_firstname;

    var map_re_base = '[a-zA-Z0-9_]+';
    var map_hash_re = new RegExp('^#/(' + map_re_base +')$')
    var map_valid_re = new RegExp('^' + map_re_base +'$')

    var error_callback = null;
    $("#errorDialog").on('hidden', function() {
        if (error_callback) {
            error_callback();
            error_callback = null;
        }
    });
    var display_error = function(error_message, callback) {
        error_callback = callback;
        $("#errorMessage").text(error_message);
        $("#errorDialog").modal();
    };

    function chooseMap() {
        /* set up the dialog */
        $("#choose-welcome").text("Hi " + user_firstname + "!");
        $("#chooseMap").modal();
        $("#openMap")
            .button()
            .click(function(ev) {
                ev.preventDefault();
                var map_name = $("#map_list").val();
                interact_map(map_name);
            });
        var update_sensitivity = function() {
            if ($("#new_map_name").val().match(map_valid_re)) {
                $("#createMap").removeAttr('disabled');
            } else {
                $("#createMap").attr('disabled', '');
            }
        }
        $("#new_map_name").keyup(function(event) {
            update_sensitivity();
        });
        $("#create-form").submit(function(event) {
            event.preventDefault();
        });
        $("#createMap")
            .button()
            .click(function(ev) {
                ev.preventDefault();
                var map_name = $("#new_map_name").val();
                if (map_name.length > 0) {
                    interact_map(map_name);
                }
            });
        /* get list of all maps, then pop up the dialog */
        $.getJSON("/api/0.1/maps", function(data) {
            var sel = $("#map_list");
            var names = [];
            $.each(data, function(map_name, map_info) {
                names.push(map_name);
            });
            names.sort();
            $.each(names, function(i, map_name) {
                var map_info = data[map_name];
                var n = map_name;
                if (map_info && (map_info.description != null)) {
                    n += ": " + map_info.description;
                }
                sel.append($('<option/>').val(map_name).text(n));
            });
        });
    }
    // mapserver is a bit crashy
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 2;

    /* personas code */
    var handle_assertion = function(assertion) {
        if (assertion) {
            return $.ajax({
                type : 'POST',
                url : '/api/0.1/login',
                data : {
                    assertion: assertion
                },
                success: function(res, status, jqXHR) {
                    hide_login();
                    attempt_bootstrap();
                },
                error: function(res, status, jqXHR) {
                    hide_login();
                    display_error(
                        "Login failed. You may not have access to this system; contact the administrator if in doubt.",
                        show_login);
                }
            });
        }
    };
    var handle_logout = function(event) {
        $.ajax({
            type: 'POST',
            url: '/api/0.1/logout',
            success: function(res, status, jqXHR) {
                window.location = "/";
            },
            error: function(res, status, jqXHR) {
                display_error("Logout failed: " + status);
            }
        });
        return false;
    };

    $("#browserid-logout").click(function(event) {
        navigator.id.logout(handle_logout);
    });
    var bootstrap_after_login = function() {
        /* set name on menu */
        $("#user-menu-user").text(user_firstname);
        // try to get map name from document hash
        var nm = window.location.hash.match(map_hash_re);
        if (nm != null) {
            interact_map(nm[1]);
        } else {
            chooseMap();
        }
    };
    $("#browserid-login").click(function(event) {
        $("#browserid-login").attr('disabled', '');
        navigator.id.get(handle_assertion);
    });
    var hide_login = function() {
        $("#loginDialog").modal("hide");
    }
    var show_login = function() {
        $("#browserid-login").removeAttr('disabled');
        $("#loginDialog").modal();
    };

    var attempt_bootstrap = function() {
        /* first, are we logged in? nothing much will work if we aren't... */
        $.getJSON("/api/0.1/userinfo", function(data) {
            if (data['status'] == 'OK') {
                user_info = data['userinfo'];
                var names = user_info['name'].split(/[, ]+/);
                user_firstname = names[0];
                bootstrap_after_login();
            } else {
                show_login();
            }
        });
    };
    attempt_bootstrap();

    function interact_map(map_name) {
        var map, polygon_editor, config, colours;

        var proj_wgs84 = new OpenLayers.Projection("EPSG:4326");
        var proj_google = new OpenLayers.Projection("EPSG:3857");
        var make_polygon_layer = function(n, geom) {
            return {
                'name' : 'Layer ' + (n+1),
                'type' : 'polygon',
                'geometry' : geom,
                'visible' : true,
                'line' : { 
                    'width' : 1,
                    'colour' : {
                        'r': 0,
                        'g': 0,
                        'b': 0,
                        'a': 1
                    }
                },
                'fill' : {
                    'expression' : '',
                    'conditional' : '',
                    'opacity' : 0.5,
                    'scale_min' : 0,
                    'scale_max' : 100,
                    'scale_flip' : false,
                    'scale_name' : 'Huey',
                    'scale_nlevels' : '6'
                },
                'background' : {
                    'label' : null
                }
            };
        }
        var add_base_maps = function() {
            function make_google(terrain, terrain_type) {
                var goog = new OpenLayers.Layer.Google(
                    "Google " + terrain, {
                        type: terrain_type,
                        sphericalMercator: true,
                        isBaseLayer: true,
                        displayInLayerSwitcher: true,
                        numZoomLevels: 22
                    }
                );
                goog.projection = proj_google;
                return goog;
            }
            var roadmap = make_google("Roadmap", google.maps.MapTypeId.ROADMAP);
            var satellite = make_google("Satellite", google.maps.MapTypeId.SATELLITE);
            var terrain = make_google("Terrain", google.maps.MapTypeId.TERRAIN);
            var hybrid = make_google("Hybrid", google.maps.MapTypeId.HYBRID);
            var osm = new OpenLayers.Layer.OSM( "OpenStreetMap");
            map.addLayers([roadmap, hybrid, satellite, terrain, osm]);
        }
        var setup_topbar = function() {
            /* set up the sidebar */
            $("button").button();
            $("#add-polygon-layer").click(function(event) {
                event.preventDefault();
                config.add_polygon_layer();
            }); 
            $("#confirmDeleteMap").click(function(event) {
                event.preventDefault();
                config.delete();
            });
            $("#export-all-to-csv").attr('href', '/api/0.1/map/' + map_name + '/export-csv');
            $("#data-menu").click(function(event) {
                var bounds = map.getExtent();
                if (bounds) {
                    var map_proj = map.getProjectionObject();
                    bounds.transform(map_proj, proj_wgs84);            
                    $("#export-bounds-to-csv").attr('href', '/api/0.1/map/' + map_name + '/export-csv/' + 
                        bounds.top + ',' + bounds.right + '/' + 
                        bounds.bottom + ',' + bounds.left);
                }
            });
            $("#delete-map").click(function(event) {
                event.preventDefault();
                $("#deleteMap").modal();
            });
            $("#print-map").click(function(event) {
                event.preventDefault();
                html2canvas($("#map")[0], {
                    //proxy: 'http://interrobang.local/api/0.1/proxy/',
                    useCORS: true,
                    onrendered: function(canvas) {
                        $("body").empty();
                        $("body")[0].appendChild(canvas);
                    }
                });
            });
            $("#about-ealgis").click(function(event) {
                event.preventDefault();
                $("#aboutBox").modal();
            });
            $("#confirmDuplicateMap").click(function(event) {
                event.preventDefault();
                var new_name = $("#target_map_name").val();
                // check we're not clobbering another map
                $.getJSON("/api/0.1/mapexists/" + new_name, function(data) {
                    if (data['exists'] == true) {
                        display_error("Target map `" + new_name + "' already exists.");
                        return;
                    } else {
                        // deep-ish copy, works well enough for a flat JSON object
                        var copied = jQuery.extend({}, config.json_data);
                        copied['administrators'] = user_info['email_address'];
                        copied['rev'] = 0;
                        var new_url = "/api/0.1/map/" + new_name;
                        config.save_to_url(new_url, copied, function() {
                            window.location.hash = "/"+new_name;
                            window.location.reload();
                        });
                    }
                });
            });
            var update_duplicate_sensitivity = function() {
                if ($("#target_map_name").val().match(map_valid_re)) {
                    $("#confirmDuplicateMap").removeAttr('disabled');
                } else {
                    $("#confirmDuplicateMap").attr('disabled', '');
                }
            }
            $("#target_map_name").keyup(function(event) {
                update_duplicate_sensitivity();
            });
            $("#duplicate-map").click(function(event) {
                event.preventDefault();
                $("#target_map_name").val(map_name + '_' + user_firstname.toLowerCase());
                $("#duplicateMap").modal();
            });
            $("#open-other-map").click(function(event) {
                event.preventDefault();
                window.location = "/";
            });
            $("#go-to-origin").click(function(event) {
                event.preventDefault();
                config.restore_map();
            });
            $("#set-origin").click(function(event) {
                event.preventDefault();
                var map_proj = map.getProjectionObject();
                var map_cent = map.getCenter();
                var zoom = map.getZoom();
                map_cent.transform(map_proj, proj_wgs84)
                config.set_map_defaults(map_cent, zoom);
                config.save('set-origin');
            });
            $("#submitGoto").click(function(event) {
                event.preventDefault();
                var locstring = $("#go-to-text").val();
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': locstring}, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (!results || results.length == 0) {
                            display_error("No results for '" + locstring + '".')
                            return;
                        }
                        var result = results[0];
                        if (result.geometry.bounds) {
                            var ne = result.geometry.bounds.getNorthEast();
                            var sw = result.geometry.bounds.getSouthWest();
                            // build an openlayers bounding box in wgs-84, then transform to the map projection
                            var bounds = new OpenLayers.Bounds();
                            bounds.extend(new OpenLayers.LonLat(ne.lng(), ne.lat()));
                            bounds.extend(new OpenLayers.LonLat(sw.lng(), sw.lat()));
                            map.zoomToExtent(bounds.transform(proj_wgs84, map.getProjectionObject()));
                        } else {
                            var loc = result.geometry.location;
                            map.setCenter(new OpenLayers.LonLat(loc.lng(), loc.lat()).transform(proj_wgs84, map.getProjectionObject()), 18);
                        }
                    } else {
                        display_error("Geocoding failed: " + status);
                    }
                });
            });
            $("#go-to-menu").click(function(event) {
                event.preventDefault();
                $("#gotoDialog").modal();
            });
            $("#saveEditPermissions").click(function(event) {
                config.set_permissions($("#map_permissions").val());
            });
            $("#set-permissions").click(function(event) {
                event.preventDefault();
                $("#map_permissions").val(config.get_permissions());
                $("#editPermissions").modal();
            });
            $("#toggle-legend").click(function(event) {
                event.preventDefault();
                config.toggle_legend_visibility();
            });
            $("#toggle-baselayer").click(function(event) {
                event.preventDefault();
                config.toggle_baselayer_visibility();
            });
        }
        var setup_map = function() {
            $("#selected_map_name").text(map_name);
            window.location.hash = "/"+map_name;
            map = new OpenLayers.Map({ div: "map" });
            window.eal_map = map; // for debugging
            map.addControl(new OpenLayers.Control.LayerSwitcher());
            add_base_maps();
            map.setCenter(new OpenLayers.LonLat(0, 0).transform(proj_wgs84, map.getProjectionObject()), 5);
        }
        var get_geom_names = function(datainfo, geom_types) {
            var geom_names = [];
            $.each(datainfo, function(geom_name) {
                var geom = datainfo[geom_name];
                $.each(geom_types, function(k, v) {
                    if (geom.type == v) {
                        geom_names.push(geom_name);
                    }
                });
            });
            geom_names.sort();
            return geom_names;
        }
        var PolygonLayerEditorUI = function() {
            this.init();
        }
        $.extend(PolygonLayerEditorUI.prototype, {
            init : function() {
                this.editing = null;
                var ui = this;
                this.editor = $("#editLayer");
                $("#layer_linecolour").spectrum({showAlpha: true});
                $("#layer_fillcolour").spectrum({showAlpha: true});
                var geoms = $("#layer_geom");
                var geom_names = get_geom_names(config.datainfo, ["MULTIPOLYGON", "GEOMETRY", "POLYGON"]);
                $.each(geom_names, function(idx, geom_name) {
                    var geom = config.datainfo[geom_name];
                    geoms.append($('<option/>').val(geom_name).text(geom.description));
                });
                var editor = this;
                this.editor.on('hidden', function() {
                    editor.editing = null;
                });
                $("#deleteLayer").click(function() {
                    return function() {
                        editor._delete_layer();
                    }
                }());
                $("#saveEditLayer").click(function() {
                    return function() {
                        editor._save_layer();
                    }
                }());
            },
            _delete_layer: function() {
                this.editing.remove();
            },
            _save_layer: function() {
                var s2int = function(s) {
                    var v = parseInt(s);
                    if (isNaN(v)) {
                        return 0;
                    }
                    return v;
                }
                var s2float = function(s) {
                    var v = parseFloat(s);
                    if (isNaN(v)) {
                        return 0;
                    }
                    return v;
                }
                //$('#editLayer button').addClass('disabled').attr('disabled', 'true');
                this.editing.layer['geometry'] = $('#layer_geom').val();
                this.editing.layer['name'] = $('#layer_name').val();
                this.editing.layer['description'] = $('#layer_description').val();
                this.editing.layer['fill']['expression'] = $('#layer_value_expression').val()
                this.editing.layer['fill']['conditional'] = $('#layer_filter_expression').val()
                this.editing.layer['fill']['scale_min'] = $('#layer_scalemin').val()
                this.editing.layer['fill']['scale_max'] = $('#layer_scalemax').val()
                this.editing.layer['fill']['scale_flip'] = $("#layer_scaleflip").hasClass('active');
                this.editing.layer['line']['width'] = s2int($('#layer_linewidth').val());
                this.editing.layer['fill']['opacity'] = s2float($('#layer_fillopacity').val()) / 100.;
                this.editing.layer['line']['colour'] = $('#layer_linecolour').spectrum("get").toRgb();
                this.editing.layer['fill']['scale_name'] = $('#layer_scalename').val();
                this.editing.layer['fill']['scale_nlevels'] = $('#layer_scalenlevels').val();
                this.editing._changed();
            },
            _sync_levels: function() {
                var levels = colours[$("#layer_scalename").val()];
                var l = $("#layer_scalenlevels");
                var chosen = l.val();
                var found = false;
                l.empty();
                $.each(levels, function(k, v) {
                    if (v == chosen) {
                        found = true;
                    }
                    l.append($('<option/>').val(v).text(v));
                });
                if (!found) {
                    var biggest = levels[levels.length - 1];
                    if (chosen > biggest) {
                        chosen = biggest;
                    } else {
                        chosen = levels[0];
                    }
                }
                l.val(chosen);
                $('#layer_scalenlevels').val(this.editing.layer['fill']['scale_nlevels']);
            },
            edit: function(controller) {
                // copy layer info into the editor
                if (controller.layer['geometry']) {
                    $('#layer_geom').val(controller.layer['geometry']);
                }
                var editor = this;
                $("#layer_scalename").change(function() {
                    editor._sync_levels();
                });
                this.editing = controller;
                $('#layer_name').val(controller.layer['name']);
                $('#layer_description').val(controller.layer['description'] || '');
                $('#layer_value_expression').val(controller.layer['fill']['expression']);
                $('#layer_filter_expression').val(controller.layer['fill']['conditional']);
                $('#layer_linecolour').spectrum('set', controller.layer['line']['colour']);
                $('#layer_linewidth').val(controller.layer['line']['width']);
                $('#layer_fillopacity').val(controller.layer['fill']['opacity'] * 100.);
                $('#layer_scalemin').val(controller.layer['fill']['scale_min']);
                $('#layer_scalemax').val(controller.layer['fill']['scale_max']);
                $('#layer_scalename').val(controller.layer['fill']['scale_name']);
                $('#layer_scaleflip').removeClass('active');
                if (controller.layer['fill']['scale_flip']) {
                    $('#layer_scaleflip').addClass('active');
                }
                this._sync_levels();
                // fire the editor off
                this.editor.modal();
            }
        });

        var PolygonLayerController = function(config, id, layer) {
            this.id = id;
            this.layer = layer;
            this.init(config);
        }
        $.extend(PolygonLayerController.prototype, {
            init : function() {
                var ui = this;
                // if another layer hides, we might need to flip the legend
                $(config).on('changed', function() {
                    ui._sync_legend(); 
                });
                // build and hook up menu item
                this.menu_item = $("<li/>");
                var anchor = $("<a/>").attr('tabindex', -1).attr('href', '#').text(this.layer['name']);
                this.menu_item.append(anchor);
                $("#layers-menu").append(this.menu_item);
                anchor.click(function(event) {
                    event.preventDefault();
                    ui.edit();
                });
                // add a button to the top bar
                this.top_button = $("<button/>");
                this.top_button.addClass("btn");
                this.top_button.click(function(event) {
                    event.preventDefault();
                    if (event.shiftKey) {
                        ui.edit();
                    } else {
                        // do we have a fill expression? if so, ask for other 
                        // fill layers to hide, and for our own layer to be shown
                        if (!ui._visible() && ui._filled()) {
                            $(ui).trigger("show-and-hide-other", [ui]);
                        } else {
                            ui._toggle_visibility();
                        }
                    }
                });
                $("#layer-buttons").append(this.top_button);
                this._sync_button();
                this.set_hash(this.layer['hash']);
            },
            _filled : function() {
                return this.layer['fill']['expression'].length > 0;
            },
            destroy : function() {
                if (this._wms_layer) {
                    map.removeLayer(this._wms_layer);
                }
                this.menu_item.remove();
                this.top_button.remove();
            },
            edit : function() {
                // copy our current state into the hidden modal editor
                if (config.administrator) {
                    polygon_editor.edit(this);
                }
            },
            _sync_button : function() {
                this.top_button.empty();
                var descr = [];
                if (this.layer['description']) {
                    descr.push(this.layer['description']);
                }
                if (this.layer['fill']) {
                    var fill = this.layer['fill'];
                    if (fill['expression']) {
                        descr.push('Value expression:\n' + fill['expression']);
                    }
                    if (fill['conditional']) {
                        descr.push('Filter expression:\n' + fill['conditional']);
                    }
                }
                var tta  = $("<span/>").attr('data-toggle', 'tooltip').attr('title', descr.join("\n")).text(this.layer['name']);
                this.top_button.append(tta);
                tta.tooltip({
                    placement: 'bottom'
                });
                if (this._visible()) {
                    this.top_button.addClass("btn-success");
                    this.top_button.removeClass("btn-danger");
                } else {
                    this.top_button.addClass("btn-danger");
                    this.top_button.removeClass("btn-success");
                }
                if (this._filled()) {
                    this.top_button.addClass("layer-filled");
                    this.top_button.removeClass("layer-unfilled");
                } else {
                    this.top_button.addClass("layer-unfilled");
                    this.top_button.removeClass("layer-filled");
                }
            },
            _visible : function() {
                return this.layer['visible'] ? true : false;
            },
            _toggle_visibility : function() {
                this.layer['visible'] = !this._visible();
                this._changed('toggle-vis');
            },
            hide : function() {
                this.layer['visible'] = false;
                this._changed('hide');
            },
            show : function() {
                this.layer['visible'] = true;
                this._changed('show');
            },
            _changed : function(why) {
                $(this).trigger("changed");
            },
            remove : function() {
                $(this).trigger("remove");
            },
            set_hash : function(hash) {
                // suppress expensive bits that can't be changed by a 
                // non-administrator
                if (hash != this.hash) {
                    this.layer['hash'] = this.hash = hash;
                    this._update_wms_layer();
                    this.menu_item.children('a').text(this.layer['name']);
                }
                // but make sure things we want non-admins to be able
                // to do are outside above 'if'
                this._update_wms_visibility();
                this._sync_button();
            },
            _sync_legend : function() {
                // set legend
                var legend_uri = '/api/0.1/map/' + map_name + '/legend/' + this.id + '/' + this.layer['hash'];
                if (this._visible() && this._filled()) {
                    $("#legend-img").attr('src', legend_uri);
                }
            },
            _update_wms_layer : function() {
                function make_wms(name, uri) {
                    var wms = new OpenLayers.Layer.WMS(name, 
                        uri, {
                            layers: 'basic', // this is the template layer used
                            format: 'png',
                            transparent: true
                        }, {
                            projection: proj_google,
                            isBaseLayer: false,
                            singleTile: false,
                            transitionEffect: null
                        });
                    return wms;
                }
                var name = this.layer['name'];
                var uri = '/api/0.1/map/' + map_name + '/mapserver_wms/' + this.id + '/' + this.layer['hash'];
                if (this._wms_layer) {
                    map.removeLayer(this._wms_layer);
                }
                this._sync_legend();
                this._wms_layer = make_wms(name, uri);
                this._update_wms_visibility();
                map.addLayer(this._wms_layer);
                if (this._filled()) {
                    map.setLayerIndex(this._wms_layer, 0);
                } else {
                    map.setLayerIndex(this._wms_layer, map.layers.length);
                }
            },
            _update_wms_visibility : function() {
                if (this._wms_layer && (this._wms_layer.getVisibility() != this._visible())) {
                    this._wms_layer.setVisibility(this._visible());
                }
            }
        });

        var MapConfig = function(datainfo) {
            this.datainfo = datainfo;
            this.init();
        }
        $.extend(MapConfig.prototype, {
            json_data : {},
            url: "/api/0.1/map/" + map_name,
            init : function() {
                this._layer_instances = {};
                var config = this;
                $(this).on("save-error", function(ev, title, body) {
                    display_error(title + " : " + body);
                });
                this.blocked = false;
            },
            get_permissions : function() {
                return this.json_data['administrators'] || '';
            },
            set_permissions : function(s) {
                this.json_data['administrators'] = s;
                this.save();
            },
            _centre_to_ui : function() {
                var defs = this.json_data['map_defaults'];
                if (defs) {
                    map.setCenter(
                        new OpenLayers.LonLat(defs['lon'], defs['lat']).transform(
                            proj_wgs84,
                            map.getProjectionObject()
                        ), defs['zoom']);
                }
            },
            _block: function() {
                this.blocked = true;
            },
            _unblock: function() {
                this.blocked = false;
            },
            _config_loaded : function(data) {
                this.administrator = data['administrator'];
                /* NB: subtle; if we're a new map, this will be 'null' not false */
                if (this.administrator == false) {
                    $("#layers-dropdown").hide();
                    $("#set-origin").hide();
                    $("#set-permissions").hide();
                    $("#delete-map").hide();
                }
                this.json_data = data['defn'];
                // new map
                if (!this.json_data['layers']) {
                    this.json_data['layers'] = {};
                    this.json_data['show_legend'] = true;
                    this.json_data['administrators'] = user_info['email_address'];
                    this.json_data['hide_baselayer'] = false;
                }
                $(this).trigger("changed");
                this._centre_to_ui();
                this._sync_layers();
                this._sync_legend_visibility();
                this._sync_baselayer_visibility();
            },
            toggle_legend_visibility : function() {
                this.json_data['show_legend'] = ! this.json_data['show_legend'];
                this.save();
                this._sync_legend_visibility();
            },
            _sync_legend_visibility : function(vis) {
                if (this.json_data['show_legend']) {
                    $("#legend").show();
                    $("#show-hide-legend").text("Hide legend");
                } else {
                    $("#legend").hide();
                    $("#show-hide-legend").text("Show legend");
                }
            },
            toggle_baselayer_visibility : function() {
                this.json_data['hide_baselayer'] = ! this.json_data['hide_baselayer'];
                this.save();
                this._sync_baselayer_visibility();
            },
            _sync_baselayer_visibility: function() {
                if (this.json_data['hide_baselayer'] == true) {
                    $("#show-hide-baselayer").text("Show baselayer");
                } else {
                    $("#show-hide-baselayer").text("Hide baselayer");
                }
                map.baseLayer.setVisibility(this.json_data['hide_baselayer'] != true);
            },
            _remove_layer: function(layer_id) {
                delete this.json_data['layers'][layer_id];
                this._sync_layers();
            },
            hide_all: function() {
                var config = this;
                $.each(this._layer_instances, function(idx,inst) {
                    inst.hide();
                });
            },
            hide_other_filled: function(from_inst) {
                var config = this;
                $.each(this._layer_instances, function(idx,inst) {
                    if (inst != from_inst && inst._filled()) {
                        inst.hide();
                    }
                });
            },
            _sync_layers: function() {
                var config = this;
                var layers = this.json_data['layers'];

                var layer_ids = [];
                $.each(layers, function(k,v) {
                    layer_ids.push(k);
                });
                layer_ids.sort();

                // add missing layer instances
                $.each(layer_ids, function(i, k) {
                    v = layers[k];
                    if (!config._layer_instances[k]) {
                        var layer, type = v.type;
                        if (type == "polygon") {
                            layer = new PolygonLayerController(config, k, v);
                            $(layer).on("show-and-hide-other", function(event, layer) {
                                try {
                                    config._block();
                                    layer.show();
                                    config.hide_other_filled(layer);
                                } finally {
                                    config._unblock();
                                    config.save('after-hide-other');
                                }
                            });
                        }
                        if (!layer) {
                            return;
                        }
                        $(layer).on("remove", function() {
                            return function() {
                                config._remove_layer(layer.id);
                                config.save('after-remove');
                            };
                        }());
                        $(layer).on("changed", function() {
                            return function() {
                                config.save('after-layer-changed');
                            };
                        }());
                        config._layer_instances[k] = layer;
                    }
                });
                // remove layer instances for deleted layers
                $.each(this._layer_instances, function(k, v) {
                    if (!layers[k]) {
                        delete config._layer_instances[k];
                        v.destroy();
                    }
                });
            },
            reload: function() {
                var config = this;
                /* grab map information */
                $.ajax({
                    url: this.url, 
                    success: function(data, textStatus, jqXHR) {
                        config._config_loaded(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        config._config_loaded({'defn' : {}});
                    }
                });
            },
            _sync_hashes: function(data) {
                var data_layers = data['layers'];
                if (!data_layers) {
                    return;
                }
                var config = this;
                $.each(this._layer_instances, function(k, v) {
                    var inst = config._layer_instances[k];
                    var data_inst = data_layers[k];
                    if (data_inst == null) {
                        return;
                    }
                    inst.set_hash(data_inst['hash']);
                });
            },
            delete: function() {
                var config = this;
                /* post map information */
                $.ajax({
                    url: this.url, 
                    type: "DELETE",
                    data: {
                    }, 
                    error: function(jqXHR, textStatus, errorThrown) {
                        window.location = "/";
                    },
                    success: function(data, textStatus, jqXHR) {
                        window.location = "/";
                    }
                });
            },
            save_to_url: function(url, json_data, cb) {
                /* post map information */
                $.ajax({
                    url: url, 
                    type: "POST",
                    data: {
                        "json": JSON.stringify(json_data)
                    }, 
                    timeout: 500 * 1000, // compilation of SQL can be slow.
                    error: function(jqXHR, textStatus, errorThrown) {
                        $(config).trigger("save-error", ["Server error", textStatus + " : " + errorThrown]);
                    },
                    success: function(data, textStatus, jqXHR) {
                        if (data['status'] == 'OK') {
                            $(config).trigger("changed");
                            config._sync_hashes(data['updated']);
                            if (cb) {
                                cb();
                            }
                        } else {
                            $(config).trigger("save-error", [data['title'], data['mesg']]);
                        }
                    }
                });
            },
            save: function(why) {
                var config = this;
                if (this.blocked) {
                    return;
                }
                if (this.administrator == false) {
                    // fake a changed event, but don't bother trying to save, we're read-only
                    $(config).trigger("changed");
                    config._sync_hashes(this.json_data);
                    return;
                }
                this.save_to_url(this.url, this.json_data);
            },
            add_polygon_layer: function() {
                /* find the next free layer identifier */
                var m = -1;
                var layers = this.json_data['layers'];
                $.each(layers, function(k,v) {
                    var n = parseInt(k);
                    if (n > m) {
                        m = n;
                    }
                });
                /* pick arbitrary first geom */
                var geom = (get_geom_names(config.datainfo, ["MULTIPOLYGON", "GEOMETRY", "POLYGON"]))[0];
                var id = m + 1;
                layers[id] = make_polygon_layer(id+1, geom);
                this._sync_layers();
                this.save();
                /* fire up editor for the new layer */
                this._layer_instances[id].edit();
            },
            set_map_defaults: function(lonlat, zoom) {
                this.json_data['map_defaults'] = {
                    'lat': lonlat.lat,
                    'lon': lonlat.lon,
                    'zoom': zoom
                };
                this._centre_to_ui();
            },
            restore_map: function() {
                this._centre_to_ui();
            }
        });

        /* grab available colour schemes */
        $.getJSON("/api/0.1/colours", function(data) {
            colours = data;
            var colour_names = [];
            $.each(colours, function(k, v) {
                colour_names.push(k);
            });
            colour_names.sort();
            var sn = $("#layer_scalename");
            $.each(colour_names, function(k, v) {
                sn.append($('<option/>').val(v).text(v));
            });
        });

        /* grab overlay information */
        $.getJSON("/api/0.1/datainfo", function(data) {
            /* build config object, pass it datainfo */
            config = new MapConfig(data);
            /* wire up UI, then load existing map config from the server */
            polygon_editor = new PolygonLayerEditorUI();
            setup_map();
            setup_topbar();
            config.reload();
        });
    }
});
