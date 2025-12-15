// seed.js
const { User, Fleur, Bouquet, BouquetFlower, sequelize } = require("./models");

async function seed() {
  try {
    // On fresh start, force recreate to ensure the new price column exists
    // On subsequent runs, just sync to ensure schema matches models
    const dbExists = require('fs').existsSync(require('path').join(__dirname, 'database.sqlite'));
    await sequelize.sync({ force: !dbExists });

    if (dbExists) {
      console.log("✓ Database synchronized");
    } else {
      console.log("✓ Database created with new schema");
    }

    // Add a small delay to allow database to settle
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (err) {
    console.error("Sync error:", err);
    throw err;
  }

  const usersData = [
    { login: "admin", password: "admin123", fullName: "Admin One", role: "admin" },
    { login: "employe", password: "employe123", fullName: "Employe Deux", role: "user" },
    { login: "client", password: "client123", fullName: "Client Trois", role: "user" }
  ];

  for (const u of usersData) {
    const [user, created] = await User.findOrCreate({
      where: { login: u.login },
      defaults: { fullName: u.fullName, passwordHash: "temp" }
    });
    if (created) {
      await user.setPassword(u.password);
      await user.save();
      console.log("Created user", u.login);
    } else {
      if (!user.passwordHash || user.passwordHash === "temp") {
        await user.setPassword(u.password);
        await user.save();
      }
      console.log("Found existing user", u.login);
    }
      // Update existing user's role if needed
        if (!created && user.role !== u.role) {
          user.role = u.role;
          await user.save();
          console.log("Updated user", u.login, "role to", u.role);
        }
    }

  const fleursData = [
    { name: "Rose", description: "Belle rose rouge", unitPrice: 1.5 },
    { name: "Tulipe", description: "Tulipe élégante", unitPrice: 1.0 },
    { name: "Lys", description: "Lys blanc", unitPrice: 2.0 }
  ];
  for (const f of fleursData) {
    await Fleur.findOrCreate({ where: { name: f.name }, defaults: f });
  }

  const [b, createdB] = await Bouquet.findOrCreate({
    where: { name: "Bouquet Découverte" },
    defaults: { description: "Mix de fleurs", img: "/images/sample.jpg" }
  });

  const rose = await Fleur.findOne({ where: { name: "Rose" } });
  const tulipe = await Fleur.findOne({ where: { name: "Tulipe" } });
  if (rose && tulipe) {
    await BouquetFlower.findOrCreate({ where: { bouquetId: b.id, fleurId: rose.id }, defaults: { quantity: 6 } });
    await BouquetFlower.findOrCreate({ where: { bouquetId: b.id, fleurId: tulipe.id }, defaults: { quantity: 4 } });
  }

  console.log("Seeding done.");
}

module.exports = seed;
