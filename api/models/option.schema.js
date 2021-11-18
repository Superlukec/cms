var mongoose = require('mongoose');

const {
	Schema
} = mongoose;

module.exports = new Schema({
    /*image: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },*/
    title: String,
    alt: String,
    img_size: String,
    img_class: String,
    img_height: String,
    space_height: String,
    layout: String,
    layout_class: String,
    box_class: String,
    column_width: String,   
    text_align: String,
    margin: String,
    padding: String,
    background_color: String,
    background_image: String,
    background_style: String,
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Brand'
    }],
    product_limit: Number,              
    products_per_column: Number,
    show_excert: {
        type: Boolean,
        default: false
    },
    filter: Boolean,    
    is_custom_filter: Boolean,
    custom_filter: [{
        is_property: {
            type: Boolean,
            default: true
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: 'PropertyCategory'
        },
        property: {
            type: Schema.Types.ObjectId,
            ref: 'Property'
        },
        sort: {
            type: Number,
            default: 0
        }
    }],
    title_color: String,
    subtitle: String,
    subtitle_color: String,
    size: String,
    alignment: String,
    lang: String,
    lon: String,        
    gallery: [{
        sort: Number,
        image: {
            type: Schema.Types.ObjectId,
            ref: 'File'
        },
        icon: String,
        is_cover: Boolean,
        icon_size: String,
        text: String,
        description: String,
        link: String
    }],
    stylized_gallery: Boolean,
    columns_per_slide: Number,
    show_slideshow_indicator: Boolean,
    indicator_color: String,
    gallery_image_height: String,
    gallery_icon_size: String,
    is_cover_image_style: Boolean,
    gallery_type: String,
    mosaic_image_width: Number,
    button_text: String,
    button_style: String,
    button_size: String,    
    button_fullwidth: Boolean,
    button_icon: String,
    button_action: String,          // link | form
    button_link: String,            // link
    button_actionvalue: String,     // value    
    news: {
        number_of_news: Number,
        layout: String
    },
    tabs: {
        max_height: String,
        stylize: Boolean,
        position: String,
        vertical: {
            type: Boolean,
            default: true
        },
        tabs: [{            
            title: String,
            text: String,
            tabType: String,            
            limit: Number,
            /*property: [{
                type: Schema.Types.ObjectId,
                ref: 'Property'
            }],*/
            products: [{
                type: Schema.Types.ObjectId,
                ref: 'Brand'
            }],
            products_per_column: Number,
            showExcert: {
                type: Boolean,
                default: false
            },
            sort: Number
        }]
    },
    template: {
        template_id: String,
        fields: [{
            name: String,
            value: String
        }]
    }
});