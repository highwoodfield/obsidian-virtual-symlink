/** @format */

import {App, MarkdownView, Modal, Notice, Plugin, Setting, TFile, Vault} from 'obsidian'

interface VirtSymlinkSettings {
}

const DEFAULT_SETTINGS: VirtSymlinkSettings = {}

export default class VirtSymlinkPlugin extends Plugin {
    settings: VirtSymlinkSettings

    async onload() {
        // await this.loadSettings();

		this.addCommand({
			id: "virtsymlink-create-virtual-symlink",
			name: "Create a virtual symlink",

			checkCallback: (checking: boolean) => {
				return this.insertCallback(checking, true);
			}
		});
    }

	insertCallback(checking: boolean, askDate: boolean): boolean | void {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView)
		if (activeView == null) return false;
		const file = activeView.file
		if (file == null) return false;
		if (checking) return true;

		this.createVirtualSymlink(file)
			.then(() => {
				new Notice("Virtual Symlink: Success")
			})
			.catch(e => {
				const msg = `Virtual Symlink: Error (${e})`;
				new Notice(msg);
				console.error(msg);
			});
	}

	async createVirtualSymlink(file: TFile): Promise<void> {
		const content = `---
virtual-symlink-target: ${file.path}
---

LNK [[${file.path}]]
This note is created by Virtual Symlink plugin.
`;
		const parent = file.parent;
		if (parent == null) {
			throw new Error("parent == null");
		}
		const createdFile = await this.app.vault.create(`${parent.path}/LNK ${file.basename}.md`, content);
		await this.app.workspace.getLeaf(false).openFile(createdFile);
	}

    onunload() {
        console.log('unloading plugin')
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    }

    async saveSettings() {
        await this.saveData(this.settings)
    }
}
