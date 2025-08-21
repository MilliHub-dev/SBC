import { Router } from 'express';
import { query } from '../db/pool.js';

export const router = Router();

// Log a web3 transaction (convert points, reward, etc.)
router.post('/', async (req, res) => {
  try {
    const { externalUserId, walletAddress, transactionHash, transactionType, chainId, network, ethAmount, usdtAmount, sabiCashAmount, pointsConverted, blockNumber, gasUsed, gasPrice, status, transactionData } = req.body;
    if (!walletAddress || !transactionHash || !transactionType) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });

    const result = await query(
      `INSERT INTO web3_transactions (external_user_id, wallet_address, transaction_hash, transaction_type, chain_id, network, eth_amount, usdt_amount, sabi_cash_amount, points_converted, block_number, gas_used, gas_price, status, transaction_data)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id, transaction_hash as "transactionHash", transaction_type as "transactionType", status, created_at as "createdAt"`,
      [externalUserId || null, walletAddress, transactionHash, transactionType, chainId || 1442, network || 'polygon-zkevm', ethAmount || null, usdtAmount || null, sabiCashAmount || null, pointsConverted || null, blockNumber || null, gasUsed || null, gasPrice || null, status || 'pending', transactionData || null]
    );
    res.status(201).json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'TX_LOG_FAILED', details: err.message });
  }
});

// Update a transaction status
router.post('/:txHash/status', async (req, res) => {
  try {
    const { txHash } = req.params;
    const { status, confirmations, blockNumber } = req.body;
    if (!status) return res.status(400).json({ success: false, error: 'INVALID_INPUT' });
    const result = await query(
      `UPDATE web3_transactions SET status = $1, confirmations = COALESCE($2, confirmations), block_number = COALESCE($3, block_number), confirmed_at = CASE WHEN $1 = 'confirmed' THEN NOW() ELSE confirmed_at END WHERE transaction_hash = $4 RETURNING id, status, confirmations, block_number as "blockNumber", confirmed_at as "confirmedAt"`,
      [status, confirmations || null, blockNumber || null, txHash]
    );
    if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'TX_NOT_FOUND' });
    res.json({ success: true, transaction: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: 'TX_UPDATE_FAILED', details: err.message });
  }
});


