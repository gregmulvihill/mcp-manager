/**
 * MCP Configuration Manager
 * 
 * Safely reads, validates, and modifies MCP service configurations
 * Maintains backups and performs atomic updates
 */

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const Ajv = require('ajv');
const logger = require('../utils/logger');

class ConfigManager {
  constructor(config) {
    this.config = config;
    this.ajv = new Ajv({ allErrors: true });
    this.backupDir = path.join(this.config.claudeDesktopPath, 'config-backups');
  }

  /**
   * Initialize the configuration manager
   */
  async initialize() {
    // Ensure backup directory exists
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      logger.info(`Backup directory created: ${this.backupDir}`);
    } catch (error) {
      logger.error('Failed to create backup directory:', error);
      throw error;
    }
    
    // Load schema
    try {
      const schemaPath = path.join(__dirname, '../../schemas/claude-desktop-config-schema.json');
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      this.configSchema = JSON.parse(schemaContent);
      this.validateSchema = this.ajv.compile(this.configSchema);
      logger.info('Configuration schema loaded successfully');
    } catch (error) {
      logger.error('Failed to load configuration schema:', error);
      throw error;
    }
  }

  /**
   * Get Claude Desktop configuration file path
   * @returns {string} Configuration file path
   */
  getConfigPath() {
    return path.join(this.config.claudeDesktopPath, 'claude_desktop_config.json');
  }

  /**
   * Read current Claude Desktop configuration
   * @returns {Promise<Object>} Configuration object
   */
  async readConfig() {
    try {
      const configPath = this.getConfigPath();
      const configContent = await fs.readFile(configPath, 'utf8');
      return JSON.parse(configContent);
    } catch (error) {
      logger.error('Failed to read configuration:', error);
      throw new Error(`Failed to read configuration: ${error.message}`);
    }
  }

  /**
   * Create backup of current configuration
   * @returns {Promise<string>} Backup file path
   */
  async backupConfig() {
    try {
      const configPath = this.getConfigPath();
      const configContent = await fs.readFile(configPath, 'utf8');
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const hash = crypto.createHash('md5').update(configContent).digest('hex').slice(0, 8);
      const backupPath = path.join(this.backupDir, `config-backup-${timestamp}-${hash}.json`);
      
      await fs.writeFile(backupPath, configContent, 'utf8');
      logger.info(`Configuration backup created: ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('Failed to create configuration backup:', error);
      throw error;
    }
  }

  /**
   * Validate configuration against schema
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result {valid, errors}
   */
  validateConfig(config) {
    const valid = this.validateSchema(config);
    return {
      valid,
      errors: this.validateSchema.errors
    };
  }

  /**
   * Safely modify configuration with automatic backup and validation
   * @param {Function} updateFn - Function that receives current config and returns modified config
   * @returns {Promise<Object>} Result of the operation
   */
  async modifyConfig(updateFn) {
    try {
      // Read current configuration
      const currentConfig = await this.readConfig();
      
      // Create backup
      const backupPath = await this.backupConfig();
      
      // Apply update function
      const updatedConfig = updateFn(JSON.parse(JSON.stringify(currentConfig)));
      
      // Validate updated configuration
      const validation = this.validateConfig(updatedConfig);
      if (!validation.valid) {
        return {
          success: false,
          error: 'Configuration validation failed',
          details: validation.errors,
          backupPath
        };
      }
      
      // Write updated configuration
      const configPath = this.getConfigPath();
      const tempPath = `${configPath}.tmp`;
      
      await fs.writeFile(tempPath, JSON.stringify(updatedConfig, null, 2), 'utf8');
      await fs.rename(tempPath, configPath);
      
      logger.info('Configuration updated successfully');
      return {
        success: true,
        backupPath,
        changes: this._diffConfig(currentConfig, updatedConfig)
      };
    } catch (error) {
      logger.error('Failed to modify configuration:', error);
      return {
        success: false,
        error: `Failed to modify configuration: ${error.message}`
      };
    }
  }
  
  /**
   * Compare old and new configurations to identify changes
   * @private
   * @param {Object} oldConfig - Previous configuration
   * @param {Object} newConfig - New configuration
   * @returns {Array} List of changes
   */
  _diffConfig(oldConfig, newConfig) {
    const changes = [];
    
    // Helper to find changes recursively
    const findChanges = (oldObj, newObj, path = '') => {
      if (oldObj === undefined) {
        changes.push({ type: 'added', path, value: newObj });
        return;
      }
      
      if (newObj === undefined) {
        changes.push({ type: 'removed', path, value: oldObj });
        return;
      }
      
      if (typeof oldObj !== typeof newObj) {
        changes.push({ 
          type: 'changed', 
          path, 
          oldValue: oldObj, 
          newValue: newObj 
        });
        return;
      }
      
      if (typeof oldObj !== 'object' || oldObj === null) {
        if (oldObj !== newObj) {
          changes.push({ 
            type: 'changed', 
            path, 
            oldValue: oldObj, 
            newValue: newObj 
          });
        }
        return;
      }
      
      // Handle arrays
      if (Array.isArray(oldObj)) {
        if (JSON.stringify(oldObj) !== JSON.stringify(newObj)) {
          changes.push({ 
            type: 'array_changed', 
            path, 
            oldValue: oldObj, 
            newValue: newObj 
          });
        }
        return;
      }
      
      // Handle objects by recursing into properties
      const allKeys = new Set([
        ...Object.keys(oldObj), 
        ...Object.keys(newObj)
      ]);
      
      for (const key of allKeys) {
        const newPath = path ? `${path}.${key}` : key;
        findChanges(oldObj[key], newObj[key], newPath);
      }
    };
    
    findChanges(oldConfig, newConfig);
    return changes;
  }
  
  /**
   * Apply a specific fix to the configuration
   * @param {string} fixId - Identifier of the fix to apply
   * @returns {Promise<Object>} Result of the operation
   */
  async applyFix(fixId) {
    // Registry of known fixes
    const fixes = {
      'fix-discord-data-url': (config) => {
        // Find discord service entry
        const mcpServers = config.mcpServers || {};
        
        for (const [key, service] of Object.entries(mcpServers)) {
          if (key.includes('discord')) {
            // Check if env exists, create if not
            if (!service.env) {
              service.env = {};
            }
            
            // Add Discord data URL if missing
            if (!service.env.DISCORD_DATA_URL) {
              service.env.DISCORD_DATA_URL = 'http://localhost:8081';
              return true;
            }
          }
        }
        
        return false;
      },
      
      // Add more fixes here
    };
    
    if (!fixes[fixId]) {
      return {
        success: false,
        error: `Unknown fix ID: ${fixId}`
      };
    }
    
    return this.modifyConfig(config => {
      const changed = fixes[fixId](config);
      logger.info(`Applied fix ${fixId}, changed: ${changed}`);
      return config;
    });
  }
}

module.exports = ConfigManager;