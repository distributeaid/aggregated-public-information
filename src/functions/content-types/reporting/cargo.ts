const volCBMMap = {
    'Banana Box': 0.05,
    'Box': 0.056,
    'Large Box': 0.087,
    'Euro Pallet': 1.92,
    'Pallet': 2.04,
    'Bag': 0.036,
    'Medium Bag': 0.079,
    'Large Bag': 0.2,
    'Bulk Bag': 0.729
  };
  
  export async function processCargo(data, strapi) {
    const { packageCount, packageUnit, item } = data;
  
    if (!packageCount || !packageUnit || !item) {
      return data;
    }
  
    const volCBM = volCBMMap[packageUnit];
    if (!volCBM) {
      return data;
    }
  
    // Fetch the related item to get countPerCBM
    const relatedItem = await strapi.entityService.findOne('api::product.item', item, {
      populate: ['category']
    });
  
    if (!relatedItem || !relatedItem.countPerCBM) {
      // Invalid related item or missing countPerCBM
      return data;
    }
  
    const countPerCBM = relatedItem.countPerCBM;
  
    // Calculate itemCount
    data.itemCount = packageCount * volCBM * countPerCBM;
  
    return data;
  }
  