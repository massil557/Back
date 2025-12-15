const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const { sequelize, User, Fleur, Bouquet, BouquetFlower, Like, Purchase, PurchaseItem } = require("./models");
const seed = require("./seed");

const app = express();
const PORT = 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
  origin: true,
  credentials: true
}));

// Routes pour les fleurs
app.get("/fleurs", async (req, res) => {
  try {
    const fleurs = await Fleur.findAll();
    res.json(fleurs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Routes pour les bouquets
app.get("/bouquets", async (req, res) => {
  try {
    const bouquets = await Bouquet.findAll({
      include: [
        { model: BouquetFlower, include: [Fleur] },
        { model: User, as: 'UsersWhoLiked', attributes: ['id', 'fullName'] }
      ]
    });

    const data = bouquets.map(b => ({
      id: b.id,
      nom: b.nom,
      description: b.description,
      image: b.image,
      prix: b.prix || 0,
      fleurs: (b.BouquetFlowers || []).map(bf => ({
        id: bf.Fleur.id,
        nom: bf.Fleur.nom,
        quantite: bf.quantite,
        prixUnitaire: bf.Fleur.prix
      }))
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Créer un bouquet
app.post("/bouquets", async (req, res) => {
  try {
    const { nom, description, prix, image, fleurs } = req.body;

    const bouquet = await Bouquet.create({
      nom,
      description,
      prix,
      image
    });

    // Ajouter les fleurs si fournies
    if (fleurs && fleurs.length > 0) {
      for (const fleur of fleurs) {
        await BouquetFlower.create({
          bouquetId: bouquet.id,
          fleurId: fleur.id,
          quantite: fleur.quantite || 1
        });
      }
    }

    res.json(bouquet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la création du bouquet" });
  }
});

// Modifier un bouquet
app.put("/bouquets/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, description, prix, image, fleurs } = req.body;

    const bouquet = await Bouquet.findByPk(id);
    if (!bouquet) {
      return res.status(404).json({ error: "Bouquet non trouvé" });
    }

    await bouquet.update({
      nom,
      description,
      prix,
      image
    });

    // Supprimer les anciennes associations fleurs
    await BouquetFlower.destroy({ where: { bouquetId: id } });

    // Ajouter les nouvelles fleurs si fournies
    if (fleurs && fleurs.length > 0) {
      for (const fleur of fleurs) {
        await BouquetFlower.create({
          bouquetId: id,
          fleurId: fleur.id,
          quantite: fleur.quantite || 1
        });
      }
    }

    res.json(bouquet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la modification du bouquet" });
  }
});

// Supprimer un bouquet
app.delete("/bouquets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Supprimer les associations fleurs d'abord
    await BouquetFlower.destroy({ where: { bouquetId: id } });

    // Supprimer les likes
    await Like.destroy({ where: { bouquetId: id } });

    const deleted = await Bouquet.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: "Bouquet supprimé" });
    } else {
      res.status(404).json({ error: "Bouquet non trouvé" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la suppression du bouquet" });
  }
});

// Liker/unliker un bouquet
app.post("/bouquets/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    // Dans cette version simplifiée, on simule un utilisateur avec ID 1
    const userId = 1;

    const existingLike = await Like.findOne({
      where: { bouquetId: id, userId }
    });

    if (existingLike) {
      await existingLike.destroy();
      res.json({ liked: false });
    } else {
      await Like.create({ bouquetId: id, userId });
      res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors du like" });
  }
});

// Obtenir les likes d'un bouquet
app.get("/bouquets/:id/likes", async (req, res) => {
  try {
    const { id } = req.params;

    const likes = await Like.findAll({
      where: { bouquetId: id },
      include: [{ model: User, attributes: ['id', 'fullName'] }]
    });

    const users = likes.map(like => ({
      id: like.User.id,
      fullName: like.User.fullName
    }));

    res.json({ users, likesCount: likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des likes" });
  }
});

// Route pour les achats (simplifiée)
app.post("/purchase", async (req, res) => {
  try {
    const { userId, purchaseItems, totalAmount } = req.body;

    const purchase = await Purchase.create({
      userId,
      totalAmount
    });

    // Créer les purchase items
    for (const item of purchaseItems) {
      await PurchaseItem.create({
        purchaseId: purchase.id,
        bouquetId: item.bouquetId,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      });
    }

    res.json({
      message: "Commande réussie",
      purchase: {
        id: purchase.id,
        totalAmount: purchase.totalAmount,
        date: purchase.createdAt
      }
    });
  } catch (err) {
    console.error("Erreur achat:", err);
    res.status(500).json({ error: "Erreur lors de l'achat" });
  }
});

// Initialisation de la base de données
const initDB = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synchronized");

    await seed();
    console.log("Database seeded");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

initDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
