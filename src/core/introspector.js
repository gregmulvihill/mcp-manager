/**
 * MCP Service Introspector
 * 
 * Deep inspection capabilities for MCP servers
 * Analyzes logs, process metrics, and service status
 */

const fs = require('fs/promises');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const logger = require('../utils/logger');

class MCPIntrospector {
  constructor(config) {
    this.config = config;
    this.logPatterns = {
      error: /ERROR|Error|Exception|Failed/i,
      warning: /WARN|Warning/i,
      startup: /Starting|Initializing|Loaded/i,
      shutdown: /Shutdown|Stopping|Terminated/i
    };
  }

  /**
   * Analyze process health using system metrics
   * @param {number} processId - The MCP service process ID
   * @returns {Promise<Object>} Process health metrics
   */
  async analyzeProcess(processId) {
    try {
      // Get process info from system
      const { stdout } = await exec(`ps -p ${processId} -o %cpu,%mem,vsz,rss,state,start,time`);
      
      // Parse metrics
      const lines = stdout.trim().split('\n');
      const headers = lines[0].trim().split(/\s+/);
      const values = lines[1]?.trim().split(/\s+/);
      
      if (!values) {
        return { error: 'Process not found', alive: false };
      }
      
      // Create metrics object
      const metrics = {};
      headers.forEach((header, index) => {
        metrics[header.toLowerCase()] = values[index];
      });
      
      // Add interpreted status
      metrics.alive = true;
      metrics.healthy = metrics.state === 'S' || metrics.state === 'R';
      metrics.cpuCritical = parseFloat(metrics['%cpu']) > 90;
      metrics.memCritical = parseFloat(metrics['%mem']) > 85;
      
      return metrics;
    } catch (error) {
      logger.error(`Process analysis failed for PID ${processId}:`, error);
      return { error: error.message, alive: false };
    }
  }

  /**
   * Analyze log files for a specific MCP service
   * @param {string} serviceName - Name of the MCP service
   * @returns {Promise<Object>} Log analysis results
   */
  async analyzeLogs(serviceName) {
    try {
      const logPath = path.join(this.config.claudeDesktopPath, 'logs', `${serviceName}.log`);
      const logContent = await fs.readFile(logPath, 'utf8');
      const lines = logContent.split('\n');
      
      // Analysis results
      const result = {
        errors: [],
        warnings: [],
        recentActivity: false,
        startupSuccess: false,
        errorPatterns: {},
        totalLines: lines.length
      };
      
      // Get logs from last 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      // Process each line
      for (const line of lines) {
        // Extract timestamp if available
        const timestampMatch = line.match(/\[(.*?)\]/);
        if (timestampMatch) {
          const timestamp = new Date(timestampMatch[1]).getTime();
          if (timestamp > oneDayAgo) {
            result.recentActivity = true;
          }
        }
        
        // Look for error patterns
        if (this.logPatterns.error.test(line)) {
          result.errors.push(line);
          
          // Count error patterns
          const errorType = this._categorizeError(line);
          result.errorPatterns[errorType] = (result.errorPatterns[errorType] || 0) + 1;
        }
        
        // Look for warnings
        if (this.logPatterns.warning.test(line)) {
          result.warnings.push(line);
        }
        
        // Check for successful startup
        if (this.logPatterns.startup.test(line) && !this.logPatterns.error.test(line)) {
          result.startupSuccess = true;
        }
      }
      
      // Limit array sizes to avoid excessive memory usage
      result.errors = result.errors.slice(-100); 
      result.warnings = result.warnings.slice(-100);
      
      // Determine service status
      result.status = this._determineServiceStatus(result);
      
      return result;
    } catch (error) {
      logger.error(`Log analysis failed for ${serviceName}:`, error);
      return { 
        error: error.message,
        status: error.code === 'ENOENT' ? 'NOT_FOUND' : 'ANALYSIS_FAILED'
      };
    }
  }
  
  /**
   * Categorize error message into known patterns
   * @private
   * @param {string} errorLine - Log line containing error
   * @returns {string} Error category
   */
  _categorizeError(errorLine) {
    if (errorLine.includes('DISCORD_DATA_URL')) return 'MISSING_ENV_VAR';
    if (errorLine.includes('Authentication failed')) return 'AUTH_FAILED';
    if (errorLine.includes('Connection refused')) return 'CONNECTION_REFUSED';
    if (errorLine.includes('Method not found')) return 'METHOD_NOT_FOUND';
    if (errorLine.includes('Out of memory')) return 'OUT_OF_MEMORY';
    return 'UNKNOWN_ERROR';
  }
  
  /**
   * Determine overall service status from log analysis
   * @private
   * @param {Object} analysis - Log analysis results
   * @returns {string} Service status
   */
  _determineServiceStatus(analysis) {
    if (analysis.error) return 'ERROR';
    if (!analysis.recentActivity) return 'INACTIVE';
    if (analysis.errors.length > 0) {
      // Check for fatal errors vs. warnings
      if (analysis.errorPatterns['MISSING_ENV_VAR'] || 
          analysis.errorPatterns['AUTH_FAILED'] ||
          analysis.errorPatterns['CONNECTION_REFUSED']) {
        return 'CRITICAL';
      }
      return 'WARNING';
    }
    if (!analysis.startupSuccess) return 'UNKNOWN';
    return 'HEALTHY';
  }
  
  /**
   * Get comprehensive report for all services
   * @returns {Promise<Object>} Status report for all services
   */
  async getFullReport() {
    const services = this.config.services || [];
    const report = {};
    
    for (const service of services) {
      logger.info(`Analyzing service: ${service.name}`);
      
      // Analyze logs
      const logAnalysis = await this.analyzeLogs(service.name);
      
      // Analyze process if PID is available
      let processAnalysis = { alive: false };
      if (service.pid) {
        processAnalysis = await this.analyzeProcess(service.pid);
      }
      
      // Combine analyses
      report[service.name] = {
        name: service.name,
        status: logAnalysis.status,
        processStatus: processAnalysis,
        lastActivity: logAnalysis.recentActivity ? 'RECENT' : 'INACTIVE',
        errorCount: logAnalysis.errors?.length || 0,
        warningCount: logAnalysis.warnings?.length || 0,
        errorPatterns: logAnalysis.errorPatterns || {},
        topErrors: (logAnalysis.errors || []).slice(-3)
      };
    }
    
    return report;
  }
}

module.exports = MCPIntrospector;