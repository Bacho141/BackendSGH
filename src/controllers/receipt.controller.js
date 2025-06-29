const Receipt = require('../models/receipt.model');

// Create a new receipt
exports.createReceipt = async (req, res) => {
  try {
    const data = req.body;
    console.log('🔍 Receipt Create - Données reçues:', {
      receiptNumber: data.receiptNumber,
      nomCaissier: data.nomCaissier,
      client: data.client?.name + ' ' + data.client?.firstname,
      total: data.total,
      produits: data.produits?.length || 0
    });
    
    console.log('🔍 Receipt Create - User info from middleware:', {
      userId: req.userId,
      userRole: req.userRole,
      userNomComplet: req.userNomComplet
    });
    
    const receipt = new Receipt(data);
    await receipt.save();
    
    console.log('✅ Receipt Create - Reçu créé avec succès:', {
      id: receipt._id,
      nomCaissier: receipt.nomCaissier
    });
    
    return res.status(201).json(receipt);
  } catch (err) {
    console.error('❌ Receipt Create - Erreur création reçu :', err);
    return res.status(500).json({ message: 'Impossible de créer le reçu.' });
  }
};

/**
 * GET /api/receipts
 * Récupère tous les reçus, éventuellement filtrés par date.
 * Query params facultatifs :
 *   - from (YYYY-MM-DD)
 *   - to   (YYYY-MM-DD)
 */
// exports.getAllReceipts = async (req, res) => {
//   try {
//     const filter = {};
//     const { from, to } = req.query;

//     if (from || to) {
//       filter.dateTime = {};
//       if (from) filter.dateTime.$gte = new Date(`${from}T00:00:00Z`);
//       if (to)   filter.dateTime.$lte = new Date(`${to}T23:59:59Z`);
//     }

//     const receipts = await Receipt.find(filter).sort({ dateTime: -1 });

//     // ===== AJOUTER CE LOG =====
//     console.log(`▶ Nombre de reçus retournés : ${receipts.length}`);
//     // ==========================

//     return res.status(200).json(receipts);
//   } catch (err) {
//     console.error('Erreur récupération reçus :', err);
//     return res.status(500).json({ message: 'Impossible de récupérer les reçus.' });
//   }
// };


/** 
GET /api/receipts
    ?from=YYYY-MM-DD        // début intervalle (optionnel)
    &to=YYYY-MM-DD          // fin intervalle (optionnel)
    &date=YYYY-MM-DD        // date fixe (ignore from/to si présent)
    &cashier=<caissierId>   // filtre par nomCaissier ou ID
    &product=<serviceId>    // filtre par produits.productId
    &status=paid|due        // « paid » pour paid>0&due=0, « due » pour due>0 
 */

exports.getAllReceipts = async (req, res) => {
  try {
    const { date, from, to, cashier, product, status } = req.query;
    const filter = {};

    //  —— Date fixe ou intervalle ——
    if (date) {
      // date unique
      const start = new Date(`${date}T00:00:00Z`);
      const end   = new Date(`${date}T23:59:59Z`);
      filter.dateTime = { $gte: start, $lte: end };
    } else if (from || to) {
      filter.dateTime = {};
      if (from) filter.dateTime.$gte = new Date(`${from}T00:00:00Z`);
      if (to)   filter.dateTime.$lte = new Date(`${to}T23:59:59Z`);
    }

    //  —— Filtre par caissier ——
    if (cashier) {
      filter.nomCaissier = cashier;
    }

    //  —— Filtre par produit/service ——
    console.log("Produit 1 :",product);

    if (product) {
      console.log("▶ Filtrage produit/service :", product);

      // On accepte soit un ID exact, soit une désignation dans produits.label
      filter['produits'] = {
        $elemMatch: {
          $or: [
            // { productId: product },             // recherche par ID exact
            { label: { $regex: product, $options: 'i' } }  // recherche par nom partiel, insensible à la casse
          ]
        }
      };
    }



    //  —— Filtre par statut de paiement ——
    if (status === 'paid') {
      filter.due = 0;
    } else if (status === 'due') {
      filter.due = { $gt: 0 };
    }

    const receipts = await Receipt.find(filter).sort({ dateTime: -1 });

    console.log(`▶ getAllReceipts – filtres ${JSON.stringify(req.query)} renvoie ${receipts.length}`);

    return res.status(200).json(receipts);
  } catch (err) {
    console.error('Erreur récupération reçus avec filtres :', err);
    return res.status(500).json({ message: 'Impossible de récupérer les reçus.' });
  }
};


/**
 * GET /api/receipts/date/:date
 * Renvoie tous les reçus de la date exacte (YYYY-MM-DD)
 */
exports.getReceiptsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    // Début et fin de journée
    const start = new Date(`${date}T00:00:00Z`);
    const end   = new Date(`${date}T23:59:59Z`);

    // Filtrage strict sur dateTime
    const receipts = await Receipt.find({
      dateTime: { $gte: start, $lte: end }
    }).sort({ dateTime: -1 });

    console.log(`▶ Reçus pour la journée ${date} : ${receipts.length}`);

    return res.status(200).json(receipts);
  } catch (err) {
    console.error(`Erreur récupération reçus pour ${req.params.date} :`, err);
    return res.status(500).json({
      message: `Impossible de récupérer les reçus pour la date ${req.params.date}.`
    });
  }
};



// Get receipt by ID
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('produits.productId');
    if (!receipt) return res.status(404).json({ message: 'Reçu non trouvé.' });
    return res.status(200).json(receipt);
  } catch (err) {
    console.error('Erreur récupération reçu :', err);
    return res.status(500).json({ message: 'Impossible de récupérer le reçu.' });
  }
};

// Update existing receipt
exports.updateReceipt = async (req, res) => {
  try {
    const updates = req.body;
    const options = { new: true, runValidators: true };
    const updated = await Receipt.findByIdAndUpdate(req.params.id, updates, options);
    if (!updated) return res.status(404).json({ message: 'Reçu non trouvé pour mise à jour.' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('Erreur mise à jour reçu :', err);
    return res.status(500).json({ message: 'Impossible de mettre à jour le reçu.' });
  }
};

// Delete a receipt
exports.deleteReceipt = async (req, res) => {
  try {
    const deleted = await Receipt.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Reçu non trouvé pour suppression.' });
    return res.status(200).json({ message: 'Reçu supprimé.' });
  } catch (err) {
    console.error('Erreur suppression reçu :', err);
    return res.status(500).json({ message: 'Impossible de supprimer le reçu.' });
  }
};

// Update receipt status (paid/due)
exports.updateReceiptStatus = async (req, res) => {
  try {
    const { receiptNumber } = req.params;
    const { paid, due } = req.body;

    console.log('🔍 Update Receipt Status - Données reçues:', {
      receiptNumber,
      paid,
      due,
      userRole: req.userRole
    });

    // Validation des données
    if (typeof paid !== 'number' || typeof due !== 'number') {
      return res.status(400).json({ 
        message: 'Les montants paid et due doivent être des nombres.' 
      });
    }

    if (paid < 0 || due < 0) {
      return res.status(400).json({ 
        message: 'Les montants ne peuvent pas être négatifs.' 
      });
    }

    // Trouver et mettre à jour le reçu
    const updatedReceipt = await Receipt.findOneAndUpdate(
      { receiptNumber: receiptNumber },
      { 
        paid: paid,
        due: due
      },
      { new: true, runValidators: true }
    );

    if (!updatedReceipt) {
      return res.status(404).json({ 
        message: 'Reçu non trouvé.' 
      });
    }

    console.log('✅ Update Receipt Status - Statut mis à jour:', {
      receiptNumber: updatedReceipt.receiptNumber,
      paid: updatedReceipt.paid,
      due: updatedReceipt.due
    });

    return res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès',
      receipt: updatedReceipt
    });
  } catch (err) {
    console.error('❌ Update Receipt Status - Erreur:', err);
    return res.status(500).json({ 
      message: 'Impossible de mettre à jour le statut du reçu.' 
    });
  }
};
