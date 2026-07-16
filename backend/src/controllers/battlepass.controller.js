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

    // LOGICA DE RECOMPENSAS EXACTAS
    let sunnysToAdd = 0;
    let skillPointsToAdd = 0;
    let avatarToAdd = null;
    let xpMult = null;
    let xpHours = 0;

    if ([3, 6, 9, 12].includes(levelToClaim)) sunnysToAdd = 100;
    else if ([14, 16, 19].includes(levelToClaim)) sunnysToAdd = 150;
    else if ([5, 10, 15].includes(levelToClaim)) { xpMult = 1.15; xpHours = 2; }
    else if (levelToClaim === 20) { xpMult = 1.20; xpHours = 2; }
    else if (levelToClaim === 18) avatarToAdd = "CUY";
    else skillPointsToAdd = 1; // 1, 2, 4, 7, 8, 11, 13, 17

    // Preparar datos de actualización de usuario
    const userUpdateData = {
        sunnys: { increment: sunnysToAdd },
        skillPoints: { increment: skillPointsToAdd }
    };

    if (avatarToAdd) userUpdateData.unlockedAvatars = { push: avatarToAdd };
    if (xpMult) {
        userUpdateData.xpBoostMultiplier = xpMult;
        const endDate = new Date();
        endDate.setHours(endDate.getHours() + xpHours);
        userUpdateData.xpBoostEndsAt = endDate;
    }

    // Ejecutamos ambas actualizaciones al mismo tiempo (Transacción)
    const [updatedBp, updatedUser] = await prisma.$transaction([
      prisma.battlePassProgress.update({
        where: { id: bp.id },
        data: { claimedLevels: { push: levelToClaim } }
      }),
      prisma.user.update({
        where: { id: req.user.id },
        data: userUpdateData,
        select: { id: true, username: true, email: true, role: true, sunnys: true, skillPoints: true }
      })
    ]);

    res.json({ success: true, claimedLevels: updatedBp.claimedLevels, updatedUser });
  } catch (error) {
    console.error("Error reclamando recompensa:", error);
    res.status(500).json({ error: "Error al reclamar la recompensa." });
  }
}

async function saveMatchXp(req, res) {
  try {
    const { xpToAdd } = req.body;
    if (!xpToAdd || xpToAdd <= 0) return res.json({ success: true, finalXp: 0 });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { battlePass: true } 
    });

    if (!user || !user.battlePass) return res.status(404).json({ error: "Progreso no encontrado." });

    // Verificamos si tiene un Boost de XP activo
    let multiplier = 1.0;
    if (user.xpBoostEndsAt && new Date() < new Date(user.xpBoostEndsAt)) {
      multiplier = user.xpBoostMultiplier || 1.0;
    }

    // Calculamos la XP final
    const finalXp = Math.floor(xpToAdd * multiplier);

    // Usamos user.battlePass en lugar de user.battlePassProgress
    let newXp = user.battlePass.xp + finalXp;
    let newLevel = user.battlePass.level;

    while (newXp >= 1000) {
      newLevel += 1;
      newXp -= 1000;
    }

    // Guardamos en la base de datos
    await prisma.battlePassProgress.update({
      where: { id: user.battlePass.id },
      data: { xp: newXp, level: newLevel }
    });

    res.json({ success: true, finalXp, level: newLevel, xp: newXp });
  } catch (error) {
    console.error("Error guardando XP de partida:", error);
    res.status(500).json({ error: "Error interno del servidor." });
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

module.exports = { getProgress, claimReward, addDevXp, saveMatchXp };