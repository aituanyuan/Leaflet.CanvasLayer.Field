/**
 * Abstract class for a Field layer on canvas, aka 'a Raster layer'
 * (ScalarField or a VectorField)
 */
L.CanvasLayer.Field = L.CanvasLayer.extend({

    options: {
        click: true, // 'onclick' event enabled
        hoverCursor: 'pointer',
        defaultCursor: 'default',
        opacity: 1
    },

    initialize: function (field, options) {
        L.Util.setOptions(this, options);
        if (field) {
            this.setData(field);
        }
    },

    onLayerDidMount: function () {
        if (this.options.click) {
            this._enableIdentify();
        }
        this._hideWhenZooming();
        this._ensureCanvasAlignment();
    },

    show() {
        if (this._canvas) {
            this._canvas.style.visibility = 'visible';
        }
    },

    hide() {
        if (this._canvas) {
            this._canvas.style.visibility = 'hidden';
        }
    },

    _enableIdentify() {
        this._map.on('click', this._queryValue, this);
        this._map.on('mousemove', this._showPointerOnValue, this);
    },

    _hideWhenZooming() {
        this._map.on('zoomstart', this.hide, this);
        this._map.on('zoomend', this.show, this);
    },

    _ensureCanvasAlignment() {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
    },

    onLayerWillUnmount: function () {
        if (this.options.click) {
            this._map.off('click', this._queryValue, this);
            this._map.off('mousemove', this._showPointerOnValue, this);
        }

        this._map.off('zoomstart', this.hide, this);
        this._map.off('zoomend', this.show, this);
    },

    needRedraw() {
        if (this._map) {
            L.CanvasLayer.prototype.needRedraw.call(this);
        }
    },

    onDrawLayer: function (viewInfo) {
        throw new TypeError('Must be overriden');
    },

    setData: function (field) {
        this._field = field;
        this.needRedraw();
    },

    setOpacity: function (opacity) {
        this.options.opacity = opacity;

        if (this._canvas) {
            this._updateOpacity();
        }
        return this;
    },

    getBounds: function () {
        let bb = this._field.extent();
        let southWest = L.latLng(bb[1], bb[0]),
            northEast = L.latLng(bb[3], bb[2]);
        let bounds = L.latLngBounds(southWest, northEast);
        return bounds;
    },

    _showPointerOnValue: function (e) {
        if (!this._field) return;

        let lon = e.latlng.lng;
        let lat = e.latlng.lat;

        let style = this._map.getContainer().style;
        if (this._field.hasValueAt(lon, lat)) {
            style.cursor = this.options.hoverCursor;
        } else {
            style.cursor = this.options.defaultCursor;
        }
    },

    _updateOpacity: function () {
        L.DomUtil.setOpacity(this._canvas, this.options.opacity);
    },

    _queryValue: function (e) {
        let lon = e.latlng.lng;
        let lat = e.latlng.lat;
        let result = {
            latlng: e.latlng,
            value: this._field.valueAt(lon, lat)
        };
        this.fireEvent('click', result); /*includes: L.Mixin.Events,*/
    },

    /**
     * Get clean context to draw on canvas
     * @returns {CanvasRenderingContext2D}
     */
    _getDrawingContext: function () {
        let g = this._canvas.getContext('2d');
        g.clearRect(0, 0, this._canvas.width, this._canvas.height);
        return g;
    }

});
