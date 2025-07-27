const getCost = (req, res) => {
  const { origin, destination, weight, courier } = req.body;
  // Dummy logic: ongkir = 10000 + berat*1000
  const cost = 10000 + (parseInt(weight) || 0) * 1000;
  res.json({
    origin,
    destination,
    weight,
    courier,
    cost,
    etd: '2-3 hari',
    note: 'Ini hanya estimasi dummy, belum terhubung ke API ongkir manapun.'
  });
};

module.exports = { getCost }; 