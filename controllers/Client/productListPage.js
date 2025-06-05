const machineRepository = require("../../repositories/machinerepository");

const productListPage = async (req, res) => {
  try {
    const searchTerm = req.query.searchTerm;
    const pageCount = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchTerms = Array.isArray(searchTerm) ? searchTerm : [searchTerm];

    if (!searchTerm) {
    }
    const machines = await machineRepository.getSearchTermProducts({
      searchTerms: searchTerms,
      page: "productPage",
      pageCount: pageCount,
      limit: limit,
    });

    res.status(200).json({ products: machines });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Server Error" });
  }
};

const productDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await machineRepository.getProducts({ id: id });
    //  if (!searchTerms) {
    //       // recommentations = await machineRepository.getSearchTermProducts({
    //       //   searchTerms : searchTerms, page : "homePage"
    //       // });
    //       console.log("not reached")
    //     } else {
    //       console.log("reached")
    //       recommentations = await machineRepository.getSearchTermProducts({
    //         searchTerms: categoryProducts.shuffledIndustries, page : "homePage"
    //       });
    //     }
    // console.log(product);
    res.status(200).json(product);
  } catch (err) {}
};

module.exports = { productListPage, productDetails };
