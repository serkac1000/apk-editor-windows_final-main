import os
import logging
import json
import shutil
from datetime import datetime
from utils.apktool import APKTool
from utils.file_manager import FileManager

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
                # Sign APK
                signed_path = os.path.join(project_dir, 'signed.apk')
                sign_success = self.apktool.sign_apk(output_path, signed_path)
                
                if sign_success:
                    logging.info(f"APK compiled and signed: {project_id}")
                    return signed_path
                else:
                    logging.warning(f"APK compiled but signing failed: {project_id}")
                    return output_path
            else:
                logging.error(f"APK compilation failed: {project_id}")
                return None
                
        except Exception as e:
            logging.error(f"Compile error: {str(e)}")
            return None
    
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
import os
import json
import logging
import shutil
from datetime import datetime
from utils.apktool import APKTool
from utils.file_manager import FileManager

class APKEditor:
    def __init__(self, projects_folder, temp_folder):
        self.projects_folder = projects_folder
        self.temp_folder = temp_folder
        self.apktool = APKTool()
        
        # Ensure directories exist
        os.makedirs(projects_folder, exist_ok=True)
        os.makedirs(temp_folder, exist_ok=True)
    
    def decompile_apk(self, apk_path, project_id, project_name):
        """Decompile APK and create project"""
        try:
            # Create project directory
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            
            os.makedirs(project_dir, exist_ok=True)
            
            # Decompile APK
            success = self.apktool.decompile(apk_path, decompiled_dir)
            
            if success:
                # Create project metadata
                metadata = {
                    'id': project_id,
                    'name': project_name,
                    'original_apk': os.path.basename(apk_path),
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat(),
                    'status': 'decompiled'
                }
                
                metadata_path = os.path.join(project_dir, 'metadata.json')
                with open(metadata_path, 'w') as f:
                    json.dump(metadata, f, indent=2)
                
                logging.info(f"APK decompiled successfully: {project_id}")
                return True
            
            return False
            
        except Exception as e:
            logging.error(f"Decompile error: {str(e)}")
            return False
    
    def get_project_resources(self, project_id):
        """Get project resources for editing"""
        resources = {
            'strings': [],
            'layouts': [],
            'images': [],
            'other': []
        }
        
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            
            if not os.path.exists(decompiled_dir):
                return resources
            
            # Find string resources
            values_dir = os.path.join(decompiled_dir, 'res/values')
            if os.path.exists(values_dir):
                for file in os.listdir(values_dir):
                    if file.endswith('.xml'):
                        resources['strings'].append(f"values/{file}")
            
            # Find layout resources
            layout_dir = os.path.join(decompiled_dir, 'res/layout')
            if os.path.exists(layout_dir):
                for file in os.listdir(layout_dir):
                    if file.endswith('.xml'):
                        resources['layouts'].append(f"layout/{file}")
            
            # Find image resources
            drawable_dirs = [
                'res/drawable',
                'res/drawable-hdpi',
                'res/drawable-mdpi',
                'res/drawable-xhdpi',
                'res/drawable-xxhdpi'
            ]
            
            for drawable_dir in drawable_dirs:
                full_path = os.path.join(decompiled_dir, drawable_dir)
                if os.path.exists(full_path):
                    for file in os.listdir(full_path):
                        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                            resources['images'].append(f"{drawable_dir.replace('res/', '')}/{file}")
            
        except Exception as e:
            logging.error(f"Error getting project resources: {str(e)}")
        
        return resources
    
    def get_resource_content(self, project_id, resource_type, resource_path):
        """Get content of a specific resource"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            
            if resource_type in ['string', 'layout']:
                file_path = os.path.join(decompiled_dir, 'res', resource_path)
                if os.path.exists(file_path):
                    with open(file_path, 'r', encoding='utf-8') as f:
                        return f.read()
            
            return ""
            
        except Exception as e:
            logging.error(f"Error getting resource content: {str(e)}")
            return ""
    
    def save_string_resource(self, project_id, resource_path, content):
        """Save string resource content"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            file_path = os.path.join(decompiled_dir, 'res', resource_path)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logging.info(f"String resource saved: {resource_path}")
            return True
            
        except Exception as e:
            logging.error(f"Error saving string resource: {str(e)}")
            return False
    
    def save_layout_resource(self, project_id, resource_path, content):
        """Save layout resource content"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            file_path = os.path.join(decompiled_dir, 'res', resource_path)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            logging.info(f"Layout resource saved: {resource_path}")
            return True
            
        except Exception as e:
            logging.error(f"Error saving layout resource: {str(e)}")
            return False
    
    def save_image_resource(self, project_id, resource_path, file):
        """Save image resource"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            file_path = os.path.join(decompiled_dir, 'res', resource_path)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            file.save(file_path)
            
            logging.info(f"Image resource saved: {resource_path}")
            return True
            
        except Exception as e:
            logging.error(f"Error saving image resource: {str(e)}")
            return False
    
    def compile_apk(self, project_id):
        """Compile APK from project"""
        try:
            project_dir = os.path.join(self.projects_folder, project_id)
            decompiled_dir = os.path.join(project_dir, 'decompiled')
            output_apk = os.path.join(project_dir, 'compiled.apk')
            
            # Compile using APKTool
            success = self.apktool.compile(decompiled_dir, output_apk)
            
            if success:
                # Sign APK
                signed_apk = os.path.join(project_dir, 'signed.apk')
                sign_success = self.apktool.sign_apk(output_apk, signed_apk)
                
                if sign_success:
                    logging.info(f"APK compiled and signed: {project_id}")
                    return signed_apk
                else:
                    logging.info(f"APK compiled (not signed): {project_id}")
                    return output_apk
            
            return None
            
        except Exception as e:
            logging.error(f"Compile error: {str(e)}")
            return None
    
    def get_compiled_apk_path(self, project_id):
        """Get path to compiled APK"""
        project_dir = os.path.join(self.projects_folder, project_id)
        
        # Check for signed APK first
        signed_apk = os.path.join(project_dir, 'signed.apk')
        if os.path.exists(signed_apk):
            return signed_apk
        
        # Check for compiled APK
        compiled_apk = os.path.join(project_dir, 'compiled.apk')
        if os.path.exists(compiled_apk):
            return compiled_apk
        
        return None
