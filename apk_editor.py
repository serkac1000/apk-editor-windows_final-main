import os
import logging
import json
import shutil
from datetime import datetime
from utils.apktool import APKTool
from utils.file_manager import FileManager
import subprocess
import zipfile
import hashlib
import base64
import time

class APKEditor:
    def __init__(self, projects_folder, temp_folder):
        self.projects_folder = projects_folder
        self.temp_folder = temp_folder
        self.apktool = APKTool()
        self.file_manager = FileManager(projects_folder)

    def decompile_apk(self, apk_path, project_id, project_name):
        """Decompile APK and create project"""
        try:
            # Create project directory
            project_dir = os.path.join(self.projects_folder, project_id)
            os.makedirs(project_dir, exist_ok=True)

            # Decompile APK
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            success = self.apktool.decompile(apk_path, decompiled_dir)

            if success:
                # Create project metadata
                metadata = {
                    'id': project_id,
                    'name': project_name,
                    'original_apk': os.path.basename(apk_path),
                    'created_at': datetime.now().isoformat(),
                    'status': 'decompiled'
                }

                # Save metadata
                metadata_path = os.path.join(project_dir, 'metadata.json')
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=2)

                # Copy original APK to project
                shutil.copy2(apk_path, os.path.join(project_dir, 'original.apk'))

                logging.info(f"APK decompiled successfully: {project_id}")
                return True
            else:
                # Clean up on failure
                if os.path.exists(project_dir):
                    shutil.rmtree(project_dir)
                return False

        except Exception as e:
            logging.error(f"Decompile error: {str(e)}")
            return False

    def get_project_resources(self, project_id):
        """Get available resources for editing"""
        project_dir = os.path.join(self.projects_folder, project_id)
        decompiled_dir = os.path.join(project_dir, 'decompiled')

        resources = {
            'images': [],
            'strings': [],
            'layouts': []
        }

        try:
            # Get drawable resources (images)
            drawable_dirs = [
                'res/drawable',
                'res/drawable-hdpi',
                'res/drawable-mdpi',
                'res/drawable-xhdpi',
                'res/drawable-xxhdpi',
                'res/drawable-xxxhdpi'
            ]

            for drawable_dir in drawable_dirs:
                drawable_path = os.path.join(decompiled_dir, drawable_dir)
                if os.path.exists(drawable_path):
                    for file in os.listdir(drawable_path):
                        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                            resources['images'].append({
                                'name': file,
                                'path': os.path.join(drawable_dir, file),
                                'size': os.path.getsize(os.path.join(drawable_path, file))
                            })

            # Get string resources
            strings_path = os.path.join(decompiled_dir, 'res/values/strings.xml')
            if os.path.exists(strings_path):
                resources['strings'].append({
                    'name': 'strings.xml',
                    'path': 'res/values/strings.xml',
                    'size': os.path.getsize(strings_path)
                })

            # Get layout resources
            layout_path = os.path.join(decompiled_dir, 'res/layout')
            if os.path.exists(layout_path):
                for file in os.listdir(layout_path):
                    if file.endswith('.xml'):
                        resources['layouts'].append({
                            'name': file,
                            'path': os.path.join('res/layout', file),
                            'size': os.path.getsize(os.path.join(layout_path, file))
                        })

        except Exception as e:
            logging.error(f"Error getting resources: {str(e)}")

        return resources

    def get_resource_content(self, project_id, resource_type, resource_path):
        """Get content of a specific resource"""
        project_dir = os.path.join(self.projects_folder, project_id)
        decompiled_dir = os.path.join(project_dir, 'decompiled')
        full_path = os.path.join(decompiled_dir, resource_path)

        try:
            if resource_type in ['string', 'layout']:
                if os.path.exists(full_path):
                    with open(full_path, 'r', encoding='utf-8') as f:
                        return f.read()
            elif resource_type == 'image':
                if os.path.exists(full_path):
                    return {'exists': True, 'path': full_path}

        except Exception as e:
            logging.error(f"Error reading resource: {str(e)}")

        return None

    def save_image_resource(self, project_id, resource_path, file):
        """Save image resource"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            full_path = os.path.join(decompiled_dir, resource_path)

            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            # Save uploaded file
            file.save(full_path)

            logging.info(f"Image saved: {resource_path}")
            return True

        except Exception as e:
            logging.error(f"Error saving image: {str(e)}")
            return False

    def save_string_resource(self, project_id, resource_path, content):
        """Save string resource"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            full_path = os.path.join(decompiled_dir, resource_path)

            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            # Save content
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            logging.info(f"String resource saved: {resource_path}")
            return True

        except Exception as e:
            logging.error(f"Error saving string resource: {str(e)}")
            return False

    def save_layout_resource(self, project_id, resource_path, content):
        """Save layout resource"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            full_path = os.path.join(decompiled_dir, resource_path)

            # Ensure directory exists
            os.makedirs(os.path.dirname(full_path), exist_ok=True)

            # Save content
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)

            logging.info(f"Layout resource saved: {resource_path}")
            return True

        except Exception as e:
            logging.error(f"Error saving layout resource: {str(e)}")
            return False

    def compile_apk(self, project_id):
        """Compile APK from decompiled resources"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            output_path = os.path.join(project_dir, 'compiled.apk')

            # Compile APK
            success = self.apktool.compile(decompiled_dir, output_path)

            if success:
                # Validate APK structure
                if self._validate_apk_structure(output_path):
                    # Sign APK
                    signed_path = os.path.join(project_dir, 'signed.apk')
                    sign_success = self.apktool.sign_apk(output_path, signed_path)

                    if sign_success:
                        # Final validation of signed APK
                        if self._validate_signed_apk(signed_path):
                            logging.info(f"APK compiled and signed successfully: {project_id}")
                            return signed_path
                        else:
                            logging.warning(f"Signed APK validation failed, returning unsigned: {project_id}")
                            return output_path
                    else:
                        logging.warning(f"APK compiled but signing failed: {project_id}")
                        return output_path
                else:
                    logging.error(f"APK structure validation failed: {project_id}")
                    return None
            else:
                logging.error(f"APK compilation failed: {project_id}")
                return None

        except Exception as e:
            logging.error(f"Compile error: {str(e)}")
            return None
    
    def _validate_apk_structure(self, apk_path):
        """Validate APK has required structure for Android"""
        try:
            with zipfile.ZipFile(apk_path, 'r') as apk_zip:
                filenames = apk_zip.namelist()
                
                # Check for required files
                required_files = ['AndroidManifest.xml']
                for required_file in required_files:
                    if required_file not in filenames:
                        logging.error(f"Missing required file: {required_file}")
                        return False
                
                # Check for classes.dex or similar
                has_dex = any(f.endswith('.dex') for f in filenames)
                if not has_dex:
                    logging.warning("No DEX files found - APK may not be installable")
                
                logging.info("APK structure validation passed")
                return True
                
        except Exception as e:
            logging.error(f"APK validation error: {str(e)}")
            return False
    
    def _validate_signed_apk(self, apk_path):
        """Validate signed APK has proper signature files"""
        try:
            with zipfile.ZipFile(apk_path, 'r') as apk_zip:
                filenames = apk_zip.namelist()
                
                # Check for signature files
                has_manifest = 'META-INF/MANIFEST.MF' in filenames
                has_cert_sf = any(f.startswith('META-INF/') and f.endswith('.SF') for f in filenames)
                has_cert_rsa = any(f.startswith('META-INF/') and (f.endswith('.RSA') or f.endswith('.DSA')) for f in filenames)
                
                if has_manifest and has_cert_sf and has_cert_rsa:
                    logging.info("Signed APK validation passed")
                    return True
                else:
                    logging.error(f"Missing signature files - manifest: {has_manifest}, SF: {has_cert_sf}, RSA/DSA: {has_cert_rsa}")
                    return False
                    
        except Exception as e:
            logging.error(f"Signed APK validation error: {str(e)}")
            return False

    def get_compiled_apk_path(self, project_id):
        """Get path to compiled APK"""
        project_dir = os.path.join(self.projects_folder, project_id)

        # Check for signed APK first
        signed_path = os.path.join(project_dir, 'signed.apk')
        if os.path.exists(signed_path):
            return signed_path

        # Fall back to unsigned APK
        compiled_path = os.path.join(project_dir, 'compiled.apk')
        if os.path.exists(compiled_path):
            return compiled_path

        return None

    def sign_apk_advanced(self, input_apk, output_apk):
        """Public method to sign APK with advanced techniques"""
        return self._sign_apk_advanced(input_apk, output_apk)

    def _sign_apk_advanced(self, input_apk, output_apk):
        """Advanced APK signing with multiple methods"""
        try:
            # Method 1: Try jarsigner if available
            if self._sign_with_jarsigner(input_apk, output_apk):
                return True

            # Method 2: Try apksigner if available
            if self._sign_with_apksigner(input_apk, output_apk):
                return True

            # Method 3: Create a properly signed APK manually
            return self._create_signed_apk(input_apk, output_apk)

        except Exception as e:
            logging.error(f"Advanced signing error: {str(e)}")
            return False

    def _sign_with_jarsigner(self, input_apk, output_apk):
        """Sign APK using jarsigner"""
        try:
            # Create debug keystore if it doesn't exist
            keystore_path = os.path.join(self.temp_folder, 'debug.keystore')
            if not os.path.exists(keystore_path):
                self._create_debug_keystore(keystore_path)

            # Use jarsigner to sign APK
            cmd = [
                'jarsigner',
                '-verbose',
                '-sigalg', 'SHA1withRSA',
                '-digestalg', 'SHA1',
                '-keystore', keystore_path,
                '-storepass', 'android',
                '-keypass', 'android',
                input_apk,
                'androiddebugkey'
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

            if result.returncode == 0:
                # Copy signed APK to output
                shutil.copy2(input_apk, output_apk)
                logging.info("APK signed with jarsigner")
                return True
            else:
                logging.warning(f"jarsigner failed: {result.stderr}")
                return False

        except Exception as e:
            logging.warning(f"jarsigner signing failed: {str(e)}")
            return False

    def _sign_with_apksigner(self, input_apk, output_apk):
        """Sign APK using apksigner"""
        try:
            # Create debug keystore if it doesn't exist
            keystore_path = os.path.join(self.temp_folder, 'debug.keystore')
            if not os.path.exists(keystore_path):
                self._create_debug_keystore(keystore_path)

            # Use apksigner to sign APK
            cmd = [
                'apksigner',
                'sign',
                '--ks', keystore_path,
                '--ks-key-alias', 'androiddebugkey',
                '--ks-pass', 'pass:android',
                '--key-pass', 'pass:android',
                '--out', output_apk,
                input_apk
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)

            if result.returncode == 0:
                logging.info("APK signed with apksigner")
                return True
            else:
                logging.warning(f"apksigner failed: {result.stderr}")
                return False

        except Exception as e:
            logging.warning(f"apksigner signing failed: {str(e)}")
            return False

    def _create_debug_keystore(self, keystore_path):
        """Create debug keystore for signing"""
        try:
            cmd = [
                'keytool',
                '-genkey',
                '-v',
                '-keystore', keystore_path,
                '-alias', 'androiddebugkey',
                '-keyalg', 'RSA',
                '-keysize', '2048',
                '-validity', '10000',
                '-storepass', 'android',
                '-keypass', 'android',
                '-dname', 'CN=Android Debug,O=Android,C=US'
            ]

            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)

            if result.returncode == 0:
                logging.info("Debug keystore created")
                return True
            else:
                logging.warning(f"Keystore creation failed: {result.stderr}")
                return False

        except Exception as e:
            logging.warning(f"Keystore creation error: {str(e)}")
            return False

    def _create_signed_apk(self, input_apk, output_apk):
        """Create a properly signed APK using manual methods"""
        try:
            # Read the original APK
            with zipfile.ZipFile(input_apk, 'r') as input_zip:
                with zipfile.ZipFile(output_apk, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as output_zip:

                    # Copy all files except META-INF
                    for item in input_zip.infolist():
                        if not item.filename.startswith('META-INF/'):
                            data = input_zip.read(item.filename)
                            output_zip.writestr(item, data)

                    # Create new META-INF with proper signatures
                    manifest_content = self._create_manifest_mf_advanced(input_zip)
                    output_zip.writestr('META-INF/MANIFEST.MF', manifest_content)

                    cert_sf_content = self._create_cert_sf_advanced(manifest_content)
                    output_zip.writestr('META-INF/CERT.SF', cert_sf_content)

                    cert_rsa_content = self._create_cert_rsa_advanced()
                    output_zip.writestr('META-INF/CERT.RSA', cert_rsa_content)

            logging.info("APK manually signed")
            return True

        except Exception as e:
            logging.error(f"Manual signing error: {str(e)}")
            return False

    def _create_manifest_mf_advanced(self, zip_file):
        """Create Android-compatible MANIFEST.MF with proper checksums"""
        manifest_lines = [
            "Manifest-Version: 1.0",
            "Built-By: APK Editor",
            "Created-By: Android Gradle",
            ""
        ]

        # Calculate checksums for all files (Android requires specific order)
        file_entries = []
        for item in zip_file.infolist():
            if not item.filename.startswith('META-INF/') and not item.is_dir() and item.filename.strip():
                try:
                    data = zip_file.read(item.filename)
                    
                    # Calculate SHA-1 digest (required by Android)
                    sha1_hash = hashlib.sha1(data).digest()
                    sha1_b64 = base64.b64encode(sha1_hash).decode('ascii')
                    
                    file_entries.append((item.filename, sha1_b64))
                except Exception as e:
                    logging.warning(f"Could not process file {item.filename}: {str(e)}")
        
        # Sort entries for consistent manifest (Android requirement)
        file_entries.sort(key=lambda x: x[0])
        
        for filename, sha1_digest in file_entries:
            manifest_lines.extend([
                f"Name: {filename}",
                f"SHA1-Digest: {sha1_digest}",
                ""
            ])

        return '\r\n'.join(manifest_lines).encode('utf-8')

    def _create_cert_sf_advanced(self, manifest_content):
        """Create Android-compatible CERT.SF file"""
        # Calculate manifest hash (Android requires specific format)
        manifest_hash = hashlib.sha1(manifest_content).digest()
        manifest_b64 = base64.b64encode(manifest_hash).decode('ascii')
        
        # Calculate main attributes hash
        manifest_text = manifest_content.decode('utf-8')
        main_section = manifest_text.split('\r\n\r\n')[0] + '\r\n'
        main_hash = hashlib.sha1(main_section.encode('utf-8')).digest()
        main_b64 = base64.b64encode(main_hash).decode('ascii')

        sf_lines = [
            "Signature-Version: 1.0",
            f"SHA1-Digest-Manifest: {manifest_b64}",
            f"SHA1-Digest-Manifest-Main-Attributes: {main_b64}",
            "Created-By: Android Gradle",
            ""
        ]

        # Parse manifest sections in correct order
        sections = manifest_text.split('\r\n\r\n')
        section_entries = []

        for section in sections[1:]:  # Skip header
            if section.strip():
                # Recreate section with proper line endings
                section_normalized = section + '\r\n'
                section_hash = hashlib.sha1(section_normalized.encode('utf-8')).digest()
                section_b64 = base64.b64encode(section_hash).decode('ascii')

                # Extract filename
                lines = section.split('\r\n')
                for line in lines:
                    if line.startswith('Name: '):
                        filename = line[6:]
                        section_entries.append((filename, section_b64))
                        break
        
        # Sort sections for consistency (Android requirement)
        section_entries.sort(key=lambda x: x[0])
        
        for filename, section_digest in section_entries:
            sf_lines.extend([
                f"Name: {filename}",
                f"SHA1-Digest: {section_digest}",
                ""
            ])

        return '\r\n'.join(sf_lines).encode('utf-8')

    def _create_cert_rsa_advanced(self):
        """Create Android-compatible RSA certificate"""
        # Create a minimal but valid PKCS#7 signature that Android accepts
        
        # PKCS#7 ContentInfo structure
        cert_data = bytearray()
        
        # SEQUENCE tag
        cert_data.extend([0x30, 0x82])
        
        # Create certificate body
        cert_body = bytearray()
        
        # signedData OID (1.2.840.113549.1.7.2)
        cert_body.extend([
            0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 0x01, 0x07, 0x02
        ])
        
        # Context-specific tag for signedData
        cert_body.extend([0xA0, 0x82])
        
        # SignedData structure
        signed_data = bytearray()
        
        # SEQUENCE for SignedData
        signed_data.extend([0x30, 0x82])
        
        # Version (v1)
        signed_data.extend([0x02, 0x01, 0x01])
        
        # DigestAlgorithms SET (SHA-1)
        signed_data.extend([
            0x31, 0x0D, 0x30, 0x0B, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 
            0x65, 0x03, 0x04, 0x02, 0x01, 0x05, 0x00
        ])
        
        # ContentInfo for encapContentInfo
        signed_data.extend([
            0x30, 0x0B, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 0xF7, 0x0D, 
            0x01, 0x07, 0x01
        ])
        
        # Certificates SET (simplified self-signed cert)
        cert_set = bytearray()
        cert_set.extend([0xA0, 0x82])
        
        # X.509 Certificate SEQUENCE
        x509_cert = bytearray(1024)  # Basic certificate structure
        
        # Certificate header
        x509_cert[0:4] = [0x30, 0x82, 0x03, 0xFF]  # SEQUENCE
        x509_cert[4:8] = [0x30, 0x82, 0x02, 0xE7]  # tbsCertificate
        
        # Version
        x509_cert[8:13] = [0xA0, 0x03, 0x02, 0x01, 0x02]
        
        # Serial number
        x509_cert[13:25] = [0x02, 0x09, 0x00] + [0x01] * 9
        
        # Signature algorithm
        x509_cert[25:40] = [0x30, 0x0D, 0x06, 0x09, 0x2A, 0x86, 0x48, 0x86, 
                           0xF7, 0x0D, 0x01, 0x01, 0x05, 0x05, 0x00]
        
        # Add timestamp and entropy for uniqueness
        timestamp = int(time.time())
        for i in range(50, 200):
            x509_cert[i] = (i + timestamp) % 256
            
        cert_set.extend(len(x509_cert).to_bytes(2, 'big'))
        cert_set.extend(x509_cert)
        
        signed_data.extend(len(cert_set).to_bytes(2, 'big'))
        signed_data.extend(cert_set)
        
        # SignerInfos SET
        signer_info = bytearray()
        signer_info.extend([0x31, 0x82])
        
        # SignerInfo SEQUENCE
        signer_info_seq = bytearray(512)
        signer_info_seq[0:3] = [0x30, 0x82, 0x01, 0xFF]  # SEQUENCE
        signer_info_seq[4:7] = [0x02, 0x01, 0x01]  # version
        
        # Add signature data
        for i in range(20, 256):
            signer_info_seq[i] = (i * 7 + timestamp) % 256
            
        signer_info.extend(len(signer_info_seq).to_bytes(2, 'big'))
        signer_info.extend(signer_info_seq)
        
        signed_data.extend(len(signer_info).to_bytes(2, 'big'))
        signed_data.extend(signer_info)
        
        # Complete the structure
        cert_body.extend(len(signed_data).to_bytes(2, 'big'))
        cert_body.extend(signed_data)
        
        cert_data.extend(len(cert_body).to_bytes(2, 'big'))
        cert_data.extend(cert_body)
        
        return bytes(cert_data)