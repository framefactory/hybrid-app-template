import { LitElement, html, property, customElement } from 'lit-element';
import "@ionic/core";
import "./styles.scss";

@customElement("ff-application")
export class Application extends LitElement
{
    render()
    {
        return html`
            <ion-app>
              <ion-header>
                <ion-toolbar>
                  <ion-title>Header</ion-title>
                </ion-toolbar>
              </ion-header>
            
              <ion-content class="ion-padding">
                <h1>Main Content</h1>
              </ion-content>
            </ion-app>
        `;
    }
}
