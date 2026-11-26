import AuthController from "../app/controllers/AuthController";
import Auth from "../app/middlewares/auth"
import HomeController from "../app/controllers/HomeController";
import AssetController from "../app/controllers/AssetController";
import CustomerController from "../app/controllers/CustomerController";
import VehicleController from "../app/controllers/VehicleController";
import SPKController from "../app/controllers/SPKController";
import InvoiceController from "../app/controllers/InvoiceController";
import ReportController from "../app/controllers/ReportController";
import HyperExpress from 'hyper-express';

const Route = new HyperExpress.Router();

/**
 * Public Routes
 * These routes are accessible without authentication
 * ------------------------------------------------
 * GET  / - Home page
 */
Route.get("/", HomeController.index);

/**
 * Account routes are paused while this workshop is used without accounts.
 * ------------------------------------------------
 * GET   /login - Login page
 * POST  /login - Process login
 * GET   /register - Registration page
 * POST  /register - Process registration
 * POST  /logout - Logout user
 * GET   /google/redirect - Google OAuth redirect
 * GET   /google/callback - Google OAuth callback
 */
// Temporarily keep the single-workshop app account-free.
const redirectToWorkshop = (_request, response) => response.redirect("/");
Route.get("/login", redirectToWorkshop);
Route.post("/login", AuthController.processLogin);
Route.get("/register", redirectToWorkshop);
Route.post("/register", AuthController.processRegister);
Route.post("/logout", AuthController.logout);
Route.get("/google/redirect", redirectToWorkshop);
Route.get("/google/callback", redirectToWorkshop);

/**
 * Password Reset Routes
 * Routes for handling password reset
 * ------------------------------------------------
 * GET   /forgot-password - Forgot password page
 * POST  /forgot-password - Send reset password link
 * GET   /reset-password/:id - Reset password page
 * POST  /reset-password - Process password reset
 */
Route.get("/forgot-password", redirectToWorkshop);
Route.post("/forgot-password", AuthController.sendResetPassword);
Route.get("/reset-password/:id", redirectToWorkshop);
Route.post("/reset-password", AuthController.resetPassword);

/**
 * SST Bengkel Public Routes
 * These routes are accessible without authentication for public access
 * ------------------------------------------------
 * Customer Management Routes
 */
Route.get("/customers", CustomerController.index);
Route.get("/customers/create", CustomerController.create);
Route.post("/customers", CustomerController.store);
Route.get("/customers/:id", CustomerController.show);
Route.get("/customers/:id/edit", CustomerController.edit);
Route.put("/customers/:id", CustomerController.update);
Route.delete("/customers/:id", CustomerController.destroy);

/**
 * Vehicle Management Routes
 */
Route.get("/vehicles", VehicleController.index);
Route.get("/vehicles/create", VehicleController.create);
Route.post("/vehicles", VehicleController.store);
Route.get("/vehicles/search", VehicleController.search);
Route.get("/vehicles/:id", VehicleController.show);
Route.get("/vehicles/:id/edit", VehicleController.edit);
Route.put("/vehicles/:id", VehicleController.update);
Route.delete("/vehicles/:id", VehicleController.destroy);

/**
 * SPK (Surat Perintah Kerja) Management Routes
 */
Route.get("/spk", SPKController.index);
Route.get("/spk/create", SPKController.create);
Route.post("/spk", SPKController.store);
Route.get("/spk/:id", SPKController.show);
Route.get("/spk/:id/edit", SPKController.edit);
Route.get("/spk/:id/pdf", SPKController.generatePdf);
Route.put("/spk/:id", SPKController.update);
Route.patch("/spk/:id/complete", SPKController.complete);
Route.delete("/spk/:id", SPKController.destroy);

/**
 * Invoice Management Routes
 */
Route.get("/invoices", InvoiceController.index);
Route.get("/invoices/create", InvoiceController.create);
Route.post("/invoices", InvoiceController.store);
Route.get("/invoices/:id", InvoiceController.show);
Route.get("/invoices/:id/edit", InvoiceController.edit);
Route.get("/invoices/:id/pdf", InvoiceController.printPdf);
Route.put("/invoices/:id", InvoiceController.update);
Route.delete("/invoices/:id", InvoiceController.destroy);

/**
 * Reports Routes
 */
Route.get("/reports", ReportController.index);
Route.get("/reports/revenue", ReportController.revenue);
Route.get("/reports/services", ReportController.services);
Route.get("/reports/customers", ReportController.customers);

/**
 * Protected Routes
 * These routes require authentication
 * ------------------------------------------------
 * GET   /home - User dashboard
 * GET   /profile - User profile
 * POST  /change-profile - Update profile
 * POST  /change-password - Change password
 * DELETE /users - Delete users (admin only)
 */
Route.get("/home", redirectToWorkshop);
Route.get("/profile", redirectToWorkshop);
Route.post("/change-profile", [Auth], AuthController.changeProfile);
Route.post("/change-password", [Auth], AuthController.changePassword);
Route.delete("/users", [Auth], AuthController.deleteUsers);

/**
 * Static Asset Handling Routes
 * 
 * 1. Dist Assets (/assets/:file)
 * Serves compiled and bundled assets from the dist/assets directory
 * - Handles JavaScript files (*.js) with proper content type
 * - Handles CSS files (*.css) with proper content type
 * - Implements in-memory caching for better performance
 * - Sets long-term browser cache headers (1 year)
 * Example URLs:
 * - /assets/app.1234abc.js
 * - /assets/main.5678def.css
 */
Route.get("/assets/:file", AssetController.distFolder);

/**
 * 2. Public Assets (/*) - Catch-all Route
 * Serves static files from the public directory
 * - Must be the LAST route in the file
 * - Only serves files with allowed extensions
 * - Returns 404 for paths without extensions
 * - Implements security checks against unauthorized access
 * 
 * Allowed file types:
 * - Images: .ico, .png, .jpeg, .jpg, .gif, .svg
 * - Documents: .txt, .pdf
 * - Fonts: .woff, .woff2, .ttf, .eot
 * - Media: .mp4, .webm, .mp3, .wav
 * - Web: .css, .js
 * 
 * Example URLs:
 * - /images/logo.png
 * - /documents/terms.pdf
 * - /fonts/roboto.woff2
 */
Route.get("/*", AssetController.publicFolder);

export default Route;
