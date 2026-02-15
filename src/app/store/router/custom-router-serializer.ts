import { RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';
import { Params, Data } from '@angular/router';

/**
 * Custom Router State Interface
 * Stores minimal router state in NgRx store
 */
export interface RouterStateUrl {
  url: string;
  params: Params;
  queryParams: Params;
  fragment: string | null;
  data: Data;
}

/**
 * Custom Router Serializer
 * Serializes router state for NgRx store
 * Reduces the amount of router state stored in the store for better performance
 */
export class CustomRouterSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    let route = routerState.root;

    // Traverse to the deepest activated route
    while (route.firstChild) {
      route = route.firstChild;
    }

    const {
      url,
      root: { queryParams, fragment },
    } = routerState;
    const { params, data } = route;

    // Return only the minimal state needed
    return {
      url,
      params,
      queryParams,
      fragment,
      data,
    };
  }
}

/**
 * Enhanced Router Serializer with additional utilities
 * Includes breadcrumbs and title extraction
 */
export interface EnhancedRouterStateUrl extends RouterStateUrl {
  breadcrumbs: string[];
  title?: string;
  navigationId?: number;
}

export class EnhancedRouterSerializer implements RouterStateSerializer<EnhancedRouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): EnhancedRouterStateUrl {
    let route = routerState.root;
    const breadcrumbs: string[] = [];
    let title: string | undefined;

    // Traverse to collect breadcrumbs and find title
    while (route.firstChild) {
      route = route.firstChild;
      
      // Collect breadcrumb if available
      if (route.data['breadcrumb']) {
        breadcrumbs.push(route.data['breadcrumb']);
      }
      
      // Get title from the deepest route
      if (route.data['title']) {
        title = route.data['title'];
      }
    }

    const {
      url,
      root: { queryParams, fragment },
    } = routerState;
    const { params, data } = route;

    return {
      url,
      params,
      queryParams,
      fragment,
      data,
      breadcrumbs,
      title,
    };
  }
}