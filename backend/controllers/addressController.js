const db = require('../config/database');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const [addresses] = await db.query(
            'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC',
            [req.user.id]
        );

        res.status(200).json({
            success: true,
            count: addresses.length,
            data: addresses
        });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const { full_name, address_line1, address_line2, city, state, zip_code, country, is_default } = req.body;

        if (!full_name || !address_line1 || !city || !zip_code || !country) {
            return res.status(400).json({
                success: false,
                message: 'Please provide required address fields (full_name, address_line1, city, zip_code, country)'
            });
        }

        // If this is the first address or is_default is true, set it as default
        const [existingAddresses] = await db.query(
            'SELECT COUNT(*) as count FROM addresses WHERE user_id = ?',
            [req.user.id]
        );

        const shouldBeDefault = existingAddresses[0].count === 0 || is_default === true;

        // If setting this as default, unset other defaults
        if (shouldBeDefault) {
            await db.query(
                'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
                [req.user.id]
            );
        }

        const [result] = await db.query(
            `INSERT INTO addresses (user_id, full_name, address_line1, address_line2, city, state, zip_code, country, is_default)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, full_name, address_line1, address_line2 || null, city, state || null, zip_code, country, shouldBeDefault]
        );

        const [addresses] = await db.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);

        res.status(201).json({
            success: true,
            message: 'Address added successfully',
            data: addresses[0]
        });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const { full_name, address_line1, address_line2, city, state, zip_code, country } = req.body;

        // Check if address exists and belongs to user
        const [addresses] = await db.query(
            'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        const updates = {};
        if (full_name) updates.full_name = full_name;
        if (address_line1) updates.address_line1 = address_line1;
        if (address_line2 !== undefined) updates.address_line2 = address_line2;
        if (city) updates.city = city;
        if (state !== undefined) updates.state = state;
        if (zip_code) updates.zip_code = zip_code;
        if (country) updates.country = country;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), req.params.id];

        await db.query(`UPDATE addresses SET ${setClause} WHERE id = ?`, values);

        const [updatedAddresses] = await db.query('SELECT * FROM addresses WHERE id = ?', [req.params.id]);

        res.status(200).json({
            success: true,
            message: 'Address updated successfully',
            data: updatedAddresses[0]
        });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        // Check if address exists and belongs to user
        const [addresses] = await db.query(
            'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        const wasDefault = addresses[0].is_default;

        await db.query('DELETE FROM addresses WHERE id = ?', [req.params.id]);

        // If deleted address was default, set another one as default
        if (wasDefault) {
            await db.query(
                'UPDATE addresses SET is_default = TRUE WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
                [req.user.id]
            );
        }

        res.status(200).json({
            success: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
    try {
        // Check if address exists and belongs to user
        const [addresses] = await db.query(
            'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (addresses.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Address not found'
            });
        }

        // Unset all defaults for this user
        await db.query(
            'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
            [req.user.id]
        );

        // Set this address as default
        await db.query(
            'UPDATE addresses SET is_default = TRUE WHERE id = ?',
            [req.params.id]
        );

        const [updatedAddresses] = await db.query('SELECT * FROM addresses WHERE id = ?', [req.params.id]);

        res.status(200).json({
            success: true,
            message: 'Default address updated',
            data: updatedAddresses[0]
        });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};
