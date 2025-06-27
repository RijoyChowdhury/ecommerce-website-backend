import mongoose from "mongoose";

// const CategoryList = [
//     {
//         categoryId: '1',
//         hasSubcategory: true,
//         categoryName: 'Fashion',
//         subCategories: [
//             {
//                 categoryId: '2',
//                 hasSubcategory: true,
//                 categoryName: 'Apparel',
//                 subCategories: [
//                     {
//                         categoryId: '3',
//                         hasSubcategory: false,
//                         categoryName: 'Dress'
//                     },
//                     {
//                         categoryId: '4',
//                         hasSubcategory: false,
//                         categoryName: 'Casual Wear'
//                     },
//                     {
//                         categoryId: '5',
//                         hasSubcategory: false,
//                         categoryName: 'Shirt'
//                     },
//                     {
//                         categoryId: '6',
//                         hasSubcategory: false,
//                         categoryName: 'Sweater'
//                     },
//                 ],
//             },
//             {
//                 categoryId: '7',
//                 hasSubcategory: true,
//                 categoryName: 'Outerwear',
//                 subCategories: [
//                     {
//                         categoryId: '8',
//                         hasSubcategory: false,
//                         categoryName: 'Coat'
//                     },
//                     {
//                         categoryId: '9',
//                         hasSubcategory: false,
//                         categoryName: 'Blazer'
//                     },
//                     {
//                         categoryId: '10',
//                         hasSubcategory: false,
//                         categoryName: 'Jacket'
//                     },
//                     {
//                         categoryId: '11',
//                         hasSubcategory: false,
//                         categoryName: 'Vest'
//                     },
//                 ],
//             },
//             {
//                 categoryId: '12',
//                 hasSubcategory: false,
//                 categoryName: 'Footwear'
//             },
//         ],
//     },
//     {
//         categoryId: '13',
//         hasSubcategory: false,
//         categoryName: 'Jewellery',
//     },
//     {
//         categoryId: '14',
//         hasSubcategory: false,
//         categoryName: 'Watches',
//     },
//     {
//         categoryId: '15',
//         hasSubcategory: true,
//         categoryName: 'Outerwear',
//         subCategories: [
//             {
//                 categoryId: '16',
//                 hasSubcategory: false,
//                 categoryName: 'Coat'
//             },
//             {
//                 categoryId: '17',
//                 hasSubcategory: false,
//                 categoryName: 'Blazer'
//             },
//             {
//                 categoryId: '18',
//                 hasSubcategory: false,
//                 categoryName: 'Jacket'
//             },
//             {
//                 categoryId: '19',
//                 hasSubcategory: false,
//                 categoryName: 'Vest'
//             },
//         ],
//     },
//     {
//         categoryId: '20',
//         hasSubcategory: false,
//         categoryName: 'Cosmetics',
//     },
//     {
//         categoryId: '21',
//         hasSubcategory: false,
//         categoryName: 'Accessories',
//     },
//     {
//         categoryId: '22',
//         hasSubcategory: true,
//         categoryName: 'Electronic',
//         subCategories: [
//             {
//                 categoryId: '23',
//                 hasSubcategory: false,
//                 categoryName: 'Mobile'
//             },
//             {
//                 categoryId: '24',
//                 hasSubcategory: false,
//                 categoryName: 'Computer'
//             },
//             {
//                 categoryId: '25',
//                 hasSubcategory: false,
//                 categoryName: 'TV'
//             },
//         ],
//     },
//     {
//         categoryId: '26',
//         hasSubcategory: false,
//         categoryName: 'Furniture',
//     },
//     {
//         categoryId: '27',
//         hasSubcategory: false,
//         categoryName: 'Sunglasses',
//     },
//     {
//         categoryId: '28',
//         hasSubcategory: false,
//         categoryName: 'Rolling Diamond',
//     },
//     {
//         categoryId: '29',
//         hasSubcategory: false,
//         categoryName: 'Xbox Controller',
//     },
//     {
//         categoryId: '30',
//         hasSubcategory: false,
//         categoryName: 'Leather Watch',
//     },
//     {
//         categoryId: '31',
//         hasSubcategory: false,
//         categoryName: 'Smart Tablet',
//     },
//     {
//         categoryId: '32',
//         hasSubcategory: false,
//         categoryName: 'Purse',
//     },
//     {
//         categoryId: '33',
//         hasSubcategory: false,
//         categoryName: 'Sunglasses'
//     },
// ];

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    hasSubcategory: {
        type: Boolean,
        default: false,
    },
    isTopLevel: {
        type: Boolean,
        default: true,
    },
    subcategories: [{
        type: mongoose.Schema.ObjectId,
        ref: 'category',
    }],
    images: [{
        type: String,
    }],
    parentCategory: {
        type: mongoose.Schema.ObjectId,
        ref: 'category',
        default: null,
    },
}, {
    timestamps: true,
});

// categorySchema.virtual('id').get(function () {
//     this._id.toHexString();
// });

// categorySchema.set('toJSON', {
//     virtuals: true,
// });

const autoPopulateSubCategories = async function (docs) {
    for (const doc of docs) {
        await doc.populate('subcategories', 'name subcategories hasSubcategory');
    }
}

categorySchema.post('find', autoPopulateSubCategories);

const CategoryModel = mongoose.model('category', categorySchema);

export default CategoryModel;