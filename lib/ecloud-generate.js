'use babel';

import EcloudGenerateView from './ecloud-generate-view';
import { CompositeDisposable } from 'atom';
import fs_p from 'fs-plus';
import mkdirp from 'mkdirp';
export default {

  ecloudGenerateView: null,
  modalPanel: null,
  subscriptions: null,
  model:null,
  project_path:null,
  file_type:'.coffee',
  path_split_char:'::',
  demo_name:'exapmle',

  activate(state) {
    this.ecloudGenerateView = new EcloudGenerateView(state.ecloudGenerateViewState);
    this.ecloudGenerateView.setKeyDown((event)=>this.keyDown(event));
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.ecloudGenerateView.getElement(),
      visible: true
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ecloud-generate:controller': () => this.controller()
    }));
    this.model = this.ecloudGenerateView.getMess().getModel();
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.ecloudGenerateView.destroy();
  },

  serialize() {
    return {
      ecloudGenerateViewState: this.ecloudGenerateView.serialize()
    };
  },

  keyDown(event){
    if(event.keyCode == 13){
      user_input = this.model.getText()
      if(user_input!=''){
        if(this.projectHaveInit()){
          this.generateProc(user_input);
        }
      }
    }
    if(event.keyCode == 27){
      this.modalPanel.hide();
    }
  },
  headProc(){
    head = []
    head.push("#--------------------------require--------------------------");
    head.push("BaseController = require 'Controller'");
    head.push("{Template} = Keeper = require 'keeper'");
    head.push("ECAPI = require 'ecapi'");
    head.push("{Render, RenderCell, $} = require 'Render'");
    return head;
  },

  controllerProc(controllerName){
    codes = [];
    codes.push("#--------------------------Controller--------------------------");
    codes.push("class " + controllerName + " extends BaseController");
    codes.push("module.exports = " + controllerName);
    codes.push("_gs = Keeper.Template 'view_global_setting'");
    return codes;
  },

  eventProc(controllerName){
    codes = [];
    codes.push("#--------------------------System Event-------------------------");
    codes.push(controllerName + "::init = (@_argv)->");
    codes.push(controllerName + "::viewDidLoad = ()->");
    codes.push(controllerName + "::viewDidDisappear = ()->");
    return codes;
  },

  exampleProc(controllerName){
    codes = []
    codes.push("#--------------------------Example--------------------------");
    codes.push(controllerName + "::example = ()->");
    codes.push("  ECAPI.call @, 'api_url', {}, (err, res)=>");
    codes.push("    #do something");
    return codes
  },

  viewProc(controllerName){
    codes = [];
    codes.push(controllerName + " = ->");
    codes.push("");
    codes.push(controllerName + "." + this.demo_name + " = ->" );
    codes.push("");
    codes.push("create_subtemplate_alias = (template)-> template[\"template_#{subtemplate_name}\"] = subtemplate for subtemplate_name, subtemplate of template when typeof subtemplate is 'function'");
    codes.push("create_subtemplate_alias " + controllerName);
    return codes
  },

  viewTemplateProc(controllerName,file_path){
    codes = [];
    codes.push("{template_"+this.demo_name+"} = " + controllerName + "::viewTemplate = Keeper.Template('" + file_path + "')");
    return codes
  },

  generateProc(user_input){
    controller_file_path = this.absPathMaker('controller',user_input);
    view_file_path = this.absPathMaker('view',user_input);

    rel_path_obj = this.relativePathMaker(user_input);

    className = rel_path_obj['class_name'];

    controllerName = className + 'Controller';
    controller_code = []
    controller_code = controller_code.concat(this.headProc());
    controller_code = controller_code.concat(this.controllerProc(controllerName));

    require_path = rel_path_obj['relative_path'];
    require_path.push(rel_path_obj['file_name']);
    controller_code = controller_code.concat(this.viewTemplateProc(controllerName,require_path.join('/')));
    controller_code = controller_code.concat(this.eventProc(controllerName));
    controller_code = controller_code.concat(this.exampleProc(controllerName));
    fs_p.writeFileSync(controller_file_path,controller_code.join("\n"));

    view_code = [].concat(this.viewProc(className));
    fs_p.writeFileSync(view_file_path,view_code.join("\n"));

    this.closeWindow();
  },

  projectHaveInit(){
    this.project_path = atom.project.getPaths()[0];
    if(this.project_path){
      return true;
    }else{
      atom.notifications.addWarning('Add Project Floder, Please!');
      this.closeWindow();
      return false;
    }
  },

  absPathMaker(root_path,user_input){
    paths = user_input.split(this.path_split_char);
    absolute_path = null;
    file_name = null;
    path_obj = this.relativePathMaker(user_input);
    absolute_path = this.mkdirTool([root_path].concat(path_obj['relative_path']));
    file_name = path_obj['file_name'];
    // 返回文件的绝对路径
    return [absolute_path,'/',file_name,this.file_type].join('');
  },

  relativePathMaker(user_input){
    paths = user_input.split(this.path_split_char);
    relative_path = null;
    file_name = null;
    class_name = null;
    if(paths.length>1){
      relative_path = paths.splice(0,paths.length-1);
      file_name = this.fileNameMaker(paths[0]);
      class_name = paths[0];
    }else{
      relative_path = [];
      file_name = this.fileNameMaker(paths[0]);
      class_name = paths[0];
    }
    // 转小写
    for (var i = 0; i < relative_path.length; i++) {
      relative_path[i] = this.fileNameMaker(relative_path[i])
    }
    return {
      relative_path:relative_path,
      file_name:file_name,
      class_name:class_name
    }
  },

  fileNameMaker(name){
    final_name = []
    for (var i = 0; i < name.length; i++) {
      char = name[i];
      if (/[A-Z]/.test(char)){
        if (i!= 0)final_name.push('_');
        final_name.push(char.toLowerCase());
      }
      else{
        final_name.push(char);
      }
    }
    return final_name.join('');
  },

  mkdirTool(path_arr){
    final_path = this.project_path+'/'+path_arr.join('/');
    mkdirp(final_path, function (err) {
        if (err) console.error(err)
        else console.log('mkdir success!')
    });
    return final_path;
  },

  insertCodeToEditView(code){
    editor = atom.workspace.getActiveTextEditor();
    if(editor){
      editor.insertText(code);
    }
    // atom.workspace.observeTextEditors(function(editor) {
    //   editor.insertText(code);
    // });
  },

  closeWindow(){
    this.model.setText('');
    this.modalPanel.hide();
  },

  controller() {
    if(this.modalPanel.isVisible()){
      return this.modalPanel.hide();
    }else{
      return this.modalPanel.show();
    }
  }

};
