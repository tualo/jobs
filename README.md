# Jobs Package

Beim Aktivieren von `use_in_offer` wird eine leere Leistungsbeschreibung
aus dem ausgewaehlten Positionstemplate erzeugt; bestehende Beschreibungen
bleiben erhalten. Falls das Template keinen Text liefert, gelten dieselben
Rueckfallwerte wie beim Laden der Positionen.

Bei der Gruppierung mit "Paket" (`one`) wird die Gruppeneinheit `7`
gespeichert und fuer die Position im Zielbeleg verwendet. Andere
Gruppierungsarten und das Aufloesen der Gruppierung entfernen diese
Ueberschreibung; die urspruengliche Positionseinheit bleibt unveraendert.
Einheitensymbol und -faktor im Bericht stammen aus der gewaehlten
Gruppeneinheit in `mengeneinheiten`.

Die Berechnungsart und die Gruppenmenge werden pro Kalkulationsposition
gespeichert und bei der Auswahl einer Gruppe wieder angezeigt. Bei
aelteren Paket-Gruppen wird `one` anhand der gespeicherten Gruppeneinheit
`7` und Gruppenmenge `1` erkannt; andere bisher nicht gespeicherte
Berechnungsarten koennen nicht nachtraeglich bestimmt werden.

Voraussetzung ist die Ausfuehrung der aktualisierten SQL-Definition
[view_job_calculation_to_report.sql](src/sql/view_job_calculation_to_report.sql)
mit den Spalten `gruppeneinheit` und `gruppenfunktion` und ihren
DS-Metadaten. Anschliessend muessen gegebenenfalls die generierten
DS-Modelle neu geladen werden.

