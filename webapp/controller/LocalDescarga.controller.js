sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel",
	"br/com/idxtecLocalDescarga/services/Session"
], function(Controller, MessageBox, JSONModel, Session) {
	"use strict";

	return Controller.extend("br.com.idxtecLocalDescarga.controller.LocalDescarga", {
		onInit: function(){
			var oJSONModel = new JSONModel();
			
			this._operacao = null;
			this._sPath = null;

			this.getOwnerComponent().setModel(oJSONModel, "model");
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		onRefresh: function(){
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.getView().byId("tableLocal").clearSelection();
		},
		
		onIncluir: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableLocal");
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oViewModel = this.getModel("view");
			
			oViewModel.setData({
				titulo: "Inserir Local de Descarga"
			});
			
			this._operacao = "incluir";
			
			var oNovoLocal = {
				"Id": 0,
				"Descricao": "",
				"InformacoesNotaFiscal": "",
				"Observacoes": "",
				"Empresa" : Session.get("EMPRESA_ID"),
				"Usuario": Session.get("USUARIO_ID"),
				"EmpresaDetails": { __metadata: { uri: "/Empresas(" + Session.get("EMPRESA_ID") + ")"}},
				"UsuarioDetails": { __metadata: { uri: "/Usuarios(" + Session.get("USUARIO_ID") + ")"}}
			};
			
			oJSONModel.setData(oNovoLocal);
			
			oTable.clearSelection();
			oDialog.open();
		},
		
		onEditar: function(){
			var oDialog = this._criarDialog();
			var oTable = this.byId("tableLocal");
			var nIndex = oTable.getSelectedIndex();
			var oModel = this.getOwnerComponent().getModel();
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oViewModel = this.getModel("view");
			
			oViewModel.setData({
				titulo: "Editar Local de Descarga"
			});
			
			this._operacao = "editar";
			
			if(nIndex === -1){
				MessageBox.warning("Selecione um Local de Descarga da tabela!");
				return;
			}
			
			var oContext = oTable.getContextByIndex(nIndex);
			this._sPath = oContext.sPath;
			
			oModel.read(oContext.sPath, {
				success: function(oData){
					oJSONModel.setData(oData);
				}
			});
			
			oTable.clearSelection();
			oDialog.open();
		},
		
		onRemover: function(){
			var that = this;
			var oTable = this.byId("tableLocal");
			var nIndex = oTable.getSelectedIndex();
			
			if(nIndex === -1){
				MessageBox.warning("Selecione um Local de Descarga da tabela!");
				return;
			}
			
			MessageBox.confirm("Deseja remover esse Local de Descarga?", {
				onClose: function(sResposta){
					if(sResposta === "OK"){
						MessageBox.success("Local de Descarga removido com sucesso!");
						that._remover(oTable, nIndex);
					} 
				}      
			});
		},
		
		_remover: function(oTable, nIndex){
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oTable.getContextByIndex(nIndex);
			
			oModel.remove(oContext.sPath,{
				success: function(){
					oModel.refresh(true);
					oTable.clearSelection();
				}
			});
		},
		
		_criarDialog: function(){
			var oView = this.getView();
			var oDialog = this.byId("LocalDescargaDialog");
			
			if(!oDialog){
				oDialog = sap.ui.xmlfragment(oView.getId(), "br.com.idxtecLocalDescarga.view.LocalDescargaDialog", this);
				oView.addDependent(oDialog);
			}
			
			return oDialog;
		},
		
		onSaveDialog: function(){
			if (this._checarCampos(this.getView())) {
				MessageBox.warning("Preencha todos os campos obrigatórios!");
				return;
			}
			if(this._operacao === "incluir"){
				this._createLocal();
				this.getView().byId("LocalDescargaDialog").close();
			} else if(this._operacao === "editar"){
				this._updateLocal();
				this.getView().byId("LocalDescargaDialog").close();
			} 
		},
		
		_getDados: function(){
			var oJSONModel = this.getOwnerComponent().getModel("model");
			var oDados = oJSONModel.getData();
			
			return oDados;
		},
		
		_createLocal: function(){
			var oModel = this.getOwnerComponent().getModel();
	
			oModel.create("/LocalDescargas", this._getDados(), {
				success: function() {
					MessageBox.success("Local de Descarga inserido com sucesso!");
					oModel.refresh(true);
				}
			});
		},
		
		_updateLocal: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			oModel.update(this._sPath, this._getDados(), {
				success: function(){
					MessageBox.success("Local de Descarga alterado com sucesso!");
					oModel.refresh(true);
				}
			});
		},
		
		onCloseDialog: function(){
			var oModel = this.getOwnerComponent().getModel();
			
			if(oModel.hasPendingChanges()){
				oModel.resetChanges();
			} 
			this.byId("LocalDescargaDialog").close();
		},
		
		_checarCampos: function(oView){
			if(oView.byId("descricao").getValue() === "" || oView.byId("infonota").getValue() === ""
			|| oView.byId("obs").getValue() === ""){
				return true;
			} else{
				return false; 
			}
		},
		
		getModel: function(sModel){
			return this.getOwnerComponent().getModel(sModel);
		}
	});
});