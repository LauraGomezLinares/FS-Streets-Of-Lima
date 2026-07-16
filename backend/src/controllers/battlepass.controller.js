const prisma = require("../lib/prisma");

// Obtener el progreso actual del jugador
async function getProgress(req, res) {
  try {
    const bp = await prisma.battlePassProgress.findFirst({
      where: { userId: req.user.id }
    });
    // Si por alguna razón no tiene uno creado, le devolvemos los valores por defecto
    if (!bp) {
      return res.json({ level: 1, xp: 0, claimedLevels: [] });
    }
    res.json(bp);
  } catch (error) {
    console.error("Error obteniendo BattlePass:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
}

// Reclamar una recompensa
async function claimReward(req, res) {
  try {
    const { levelToClaim } = req.body;
    const bp = await prisma.battlePassProgress.findFirst({ where: { userId: req.user.id } });
    
    if (!bp) return res.status(404).json({ error: "Progreso no encontrado." });
    if (levelToClaim > bp.level) return res.status(400).json({ error: "Nivel aún no alcanzado." });
    if (bp.claimedLevels.includes(levelToClaim)) return res.status(400).json({ error: "Recompensa ya reclamada." });

    // Actualizamos el arreglo de niveles reclamados
    const updatedBp = await prisma.battlePassProgress.update({
      where: { id: bp.id },
      data: { claimedLevels: { push: levelToClaim } }
    });

    res.json({ success: true, claimedLevels: updatedBp.claimedLevels });
  } catch (error) {
    console.error("Error reclamando recompensa:", error);
    res.status(500).json({ error: "Error al reclamar la recompensa." });
  }
}

// [DEV] Botón de simular XP
async function addDevXp(req, res) {
  try {
    const bp = await prisma.battlePassProgress.findFirst({ where: { userId: req.user.id } });
    if (!bp) return res.status(404).json({ error: "Progreso no encontrado." });

    let newXp = bp.xp + 250;
    let newLevel = bp.level;

    if (newXp >= 1000) {
      newLevel += 1;
      newXp = newXp - 1000;
    }

    const updatedBp = await prisma.battlePassProgress.update({
      where: { id: bp.id },
      data: { xp: newXp, level: newLevel }
    });

    res.json(updatedBp);
  } catch (error) {
    console.error("Error añadiendo XP:", error);
    res.status(500).json({ error: "Error al añadir XP." });
  }
}

module.exports = { getProgress, claimReward, addDevXp };