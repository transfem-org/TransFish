<mk-drive-page>
	<mk-ui ref="ui">
		<mk-drive ref="browser" folder={ parent.opts.folder } file={ parent.opts.file }></mk-drive>
	</mk-ui>
	<style type="stylus">
		:scope
			display block

	</style>
	<script>
		@mixin \ui
		@mixin \ui-progress

		@on \mount ~>
			document.title = 'Misskey Drive'
			@ui.trigger \title '<i class="fa fa-cloud"></i>ドライブ'

			@refs.ui.refs.browser.on \begin-load ~>
				@Progress.start!

			@refs.ui.refs.browser.on \loaded-mid ~>
				@Progress.set 0.5

			@refs.ui.refs.browser.on \loaded ~>
				@Progress.done!

			@refs.ui.refs.browser.on \move-root ~>
				@ui.trigger \title '<i class="fa fa-cloud"></i>ドライブ'

				# Rewrite URL
				history.push-state null null '/i/drive'

			@refs.ui.refs.browser.on \open-folder (folder, silent) ~>
				# TODO: escape html characters in folder.name
				@ui.trigger \title '<i class="fa fa-folder-open"></i>' + folder.name

				if !silent
					# Rewrite URL
					history.push-state null null '/i/drive/folder/' + folder.id

			@refs.ui.refs.browser.on \open-file (file, silent) ~>
				# TODO: escape html characters in file.name
				@ui.trigger \title '<mk-file-type-icon class="icon"></mk-file-type-icon>' + file.name
				riot.mount \mk-file-type-icon do
					type: file.type

				if !silent
					# Rewrite URL
					history.push-state null null '/i/drive/file/' + file.id
	</script>
</mk-drive-page>
